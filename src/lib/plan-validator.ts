import type { ExperienceLevel } from "@/generated/prisma"
import { PLAN_RULES } from "@/lib/plan-config"
import type { TrainingPlanInput, WorkoutInput } from "@/lib/validations/training-plan"

export type PlanContext = {
  experienceLevel: ExperienceLevel
  daysPerWeek: number
  minutesPerSession: number
  requestedWeeks: number
  hasRaceDate: boolean
}

function workoutMinutes(workout: WorkoutInput) {
  return workout.segments.reduce(
    (sum, segment) => sum + (segment.targetDurationMin ?? 0),
    0
  )
}

function isHard(workout: WorkoutInput) {
  return workout.segments.some((segment) => segment.targetIntensity === "HARD")
}

// Returns plain-English problems. An empty list means the plan passed.
export function validatePlan(plan: TrainingPlanInput, context: PlanContext): string[] {
  const problems: string[] = []

  if (plan.totalWeeks !== context.requestedWeeks) {
    problems.push(
      `The plan must be ${context.requestedWeeks} weeks long, not ${plan.totalWeeks}`
    )
  }

  // Group the workouts by week
  const weeks = new Map<number, WorkoutInput[]>()
  for (const workout of plan.workouts) {
    weeks.set(workout.weekNumber, [...(weeks.get(workout.weekNumber) ?? []), workout])
  }

  // Every week needs exactly one workout for each day, 1 to 7
  for (let week = 1; week <= context.requestedWeeks; week++) {
    const days = (weeks.get(week) ?? [])
      .map((workout) => workout.dayOfWeek)
      .sort((a, b) => a - b)
    const complete = days.length === 7 && days.every((day, index) => day === index + 1)
    if (!complete) {
      problems.push(`Week ${week} must have exactly one workout for each day from 1 to 7`)
    }
  }
  // The other checks only make sense for a complete plan
  if (problems.length > 0) return problems

  const weekMinutes: number[] = []
  // Each day in the plan gets a number: (week - 1) * 7 + day
  const hardDays = new Set<number>()
  const minTrainingDays = Math.ceil(
    context.daysPerWeek * PLAN_RULES.minTrainingDaysFraction
  )

  for (let week = 1; week <= context.requestedWeeks; week++) {
    const training = (weeks.get(week) ?? []).filter(
      (workout) => workout.discipline !== "REST"
    )

    // RULE 1: respect the number of training days the athlete chose
    if (training.length > context.daysPerWeek) {
      problems.push(
        `Week ${week} has ${training.length} training days, more than the ${context.daysPerWeek} the athlete chose`
      )
    } else if (training.length < minTrainingDays) {
      problems.push(
        `Week ${week} has only ${training.length} training days, at least ${minTrainingDays} are needed`
      )
    }

    // RULE 6: swim, bike and run all appear (a brick counts as bike and run)
    if (training.length >= 3) {
      const used = new Set(
        training.flatMap((workout) => workout.segments.map((segment) => segment.discipline))
      )
      for (const discipline of ["SWIM", "BIKE", "RUN"] as const) {
        if (!used.has(discipline)) {
          problems.push(`Week ${week} has no ${discipline.toLowerCase()} session`)
        }
      }
    }

    let hardSessions = 0
    for (const workout of training) {
      const label = `Week ${week}, day ${workout.dayOfWeek} (${workout.title})`

      // RULE 2: stay within the session length
      if (workout.segments.some((segment) => !segment.targetDurationMin)) {
        problems.push(`${label}: every segment needs a duration`)
      } else if (workoutMinutes(workout) > context.minutesPerSession) {
        problems.push(
          `${label} is ${workoutMinutes(workout)} minutes, over the ${context.minutesPerSession} minute limit`
        )
      }

      // RULE 7 needs an intensity on every segment
      if (workout.segments.some((segment) => !segment.targetIntensity)) {
        problems.push(`${label}: every segment needs an intensity`)
      }

      // RULE 13: explain the workout and what it works
      if ((workout.description ?? "").trim().length < PLAN_RULES.minDescriptionLength) {
        problems.push(`${label} needs a short explanation`)
      }
      if (workout.muscleGroups.length === 0) {
        problems.push(`${label} needs at least one targeted muscle group`)
      }

      // RULE 5: no early brick sessions for beginners
      if (
        workout.discipline === "BRICK" &&
        context.experienceLevel === "BEGINNER" &&
        week <= PLAN_RULES.beginnerBrickFreeWeeks
      ) {
        problems.push(
          `${label} is a brick session in week ${week}; beginners do none before week ${PLAN_RULES.beginnerBrickFreeWeeks + 1}`
        )
      }

      if (isHard(workout)) {
        hardSessions += 1
        hardDays.add((week - 1) * 7 + workout.dayOfWeek)
      }
    }

    // RULE 7: limit hard sessions
    if (hardSessions > PLAN_RULES.maxHardSessionsPerWeek) {
      problems.push(
        `Week ${week} has ${hardSessions} hard sessions, more than ${PLAN_RULES.maxHardSessionsPerWeek}`
      )
    }

    weekMinutes.push(training.reduce((sum, workout) => sum + workoutMinutes(workout), 0))
  }

  // RULE 7: no long runs of hard days (counted across week boundaries too)
  for (const day of [...hardDays].sort((a, b) => a - b)) {
    if (hardDays.has(day - 1)) continue // not the start of a run
    let length = 1
    while (hardDays.has(day + length)) length += 1
    if (length > PLAN_RULES.maxConsecutiveHardDays) {
      problems.push(
        `Hard workouts on ${length} days in a row starting at week ${Math.ceil(day / 7)}, day ${((day - 1) % 7) + 1}`
      )
    }
  }

  // RULE 3 and 4: gradual progression with recovery weeks
  const increaseLimit = 1 + PLAN_RULES.maxWeeklyIncreasePercent / 100
  const recoveryLimit = 1 - PLAN_RULES.recoveryReductionPercent / 100
  let referenceWeek = 0 // the last build week, used as the comparison
  let buildWeeksInARow = 1
  for (let i = 1; i < weekMinutes.length; i++) {
    const isRecovery = weekMinutes[i] <= weekMinutes[i - 1] * recoveryLimit
    if (isRecovery) {
      buildWeeksInARow = 0
      continue
    }
    if (weekMinutes[i] > weekMinutes[referenceWeek] * increaseLimit) {
      problems.push(
        `Week ${i + 1} (${weekMinutes[i]} min) is more than ${PLAN_RULES.maxWeeklyIncreasePercent}% above week ${referenceWeek + 1} (${weekMinutes[referenceWeek]} min)`
      )
    }
    referenceWeek = i
    buildWeeksInARow += 1
    if (buildWeeksInARow > PLAN_RULES.maxBuildWeeksInARow) {
      problems.push(
        `No recovery week before week ${i + 1}; a lighter week is needed at least every ${PLAN_RULES.maxBuildWeeksInARow} weeks`
      )
    }
  }

  // RULE 8: taper before a race
  if (context.hasRaceDate && weekMinutes.length > 1) {
    const last = weekMinutes[weekMinutes.length - 1]
    const peak = Math.max(...weekMinutes.slice(0, -1))
    if (last > peak * (1 - PLAN_RULES.taperReductionPercent / 100)) {
      problems.push(
        `The final week (${last} min) must be at least ${PLAN_RULES.taperReductionPercent}% lighter than the peak week (${peak} min) to taper before the race`
      )
    }
  }

  return problems
}