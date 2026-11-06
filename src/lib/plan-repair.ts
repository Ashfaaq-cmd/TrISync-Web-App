import { PLAN_RULES } from "@/lib/plan-config"
import type { PlanContext } from "@/lib/plan-validator"
import type { TrainingPlanInput, WorkoutInput } from "@/lib/validations/training-plan"

function workoutMinutes(workout: WorkoutInput) {
  return workout.segments.reduce(
    (sum, segment) => sum + (segment.targetDurationMin ?? 0),
    0
  )
}

function isHard(workout: WorkoutInput) {
  return workout.segments.some((segment) => segment.targetIntensity === "HARD")
}

// Shorten a workout while keeping the shape of its segments
function scaleWorkout(workout: WorkoutInput, factor: number) {
  for (const segment of workout.segments) {
    if (segment.targetDurationMin) {
      segment.targetDurationMin = Math.max(1, Math.floor(segment.targetDurationMin * factor))
    }
    if (segment.targetDistanceKm) {
      segment.targetDistanceKm = Math.max(
        0.1,
        Math.round(segment.targetDistanceKm * factor * 10) / 10
      )
    }
  }
}

function isComplete(plan: TrainingPlanInput, weeks: number) {
  for (let week = 1; week <= weeks; week++) {
    const days = plan.workouts
      .filter((workout) => workout.weekNumber === week)
      .map((workout) => workout.dayOfWeek)
      .sort((a, b) => a - b)
    if (days.length !== 7 || days.some((day, index) => day !== index + 1)) return false
  }
  return true
}

// Fixes small rule breaks by reducing the plan. It never makes anything harder or longer.
export function repairPlan(original: TrainingPlanInput, context: PlanContext) {
  const plan = structuredClone(original)
  const repairs: string[] = []

  // Only a complete plan can be repaired; anything else goes back to the AI
  if (plan.totalWeeks !== context.requestedWeeks || !isComplete(plan, context.requestedWeeks)) {
    return { plan, repairs }
  }

  const overage = 1 + PLAN_RULES.maxRepairOveragePercent / 100

  // 1. Workouts a little over the session limit are shortened to fit
  for (const workout of plan.workouts) {
    if (workout.discipline === "REST") continue
    const minutes = workoutMinutes(workout)
    if (minutes > context.minutesPerSession && minutes <= context.minutesPerSession * overage) {
      scaleWorkout(workout, context.minutesPerSession / minutes)
      repairs.push(
        `Week ${workout.weekNumber}, day ${workout.dayOfWeek}: shortened from ${minutes} to ${workoutMinutes(workout)} minutes to fit the session limit`
      )
    }
  }

  // 2. Hard sessions that break the rules become moderate
  // (this assumes the rule is "no hard sessions on consecutive days")
  const ordered = [...plan.workouts].sort(
    (a, b) => a.weekNumber - b.weekNumber || a.dayOfWeek - b.dayOfWeek
  )
  let previousHardDay = -10
  const hardInWeek = new Map<number, number>()

  for (const workout of ordered) {
    if (!isHard(workout)) continue
    const day = (workout.weekNumber - 1) * 7 + workout.dayOfWeek
    const countThisWeek = hardInWeek.get(workout.weekNumber) ?? 0

    const reason =
      context.isUnwell && workout.weekNumber <= 2
        ? "the athlete reported being unwell"
        : day - previousHardDay === 1
          ? "hard sessions on two days in a row"
          : countThisWeek >= PLAN_RULES.maxHardSessionsPerWeek
            ? "too many hard sessions in the week"
            : null

    if (reason) {
      for (const segment of workout.segments) {
        if (segment.targetIntensity === "HARD") segment.targetIntensity = "MODERATE"
      }
      repairs.push(
        `Week ${workout.weekNumber}, day ${workout.dayOfWeek}: changed from hard to moderate (${reason})`
      )
    } else {
      previousHardDay = day
      hardInWeek.set(workout.weekNumber, countThisWeek + 1)
    }
  }

  // 3. A week that grows too fast is scaled down to the allowed maximum
  const weekMinutes = (week: number) =>
    plan.workouts
      .filter((workout) => workout.weekNumber === week && workout.discipline !== "REST")
      .reduce((sum, workout) => sum + workoutMinutes(workout), 0)

  const increaseLimit = 1 + PLAN_RULES.maxWeeklyIncreasePercent / 100
  const recoveryLimit = 1 - PLAN_RULES.recoveryReductionPercent / 100
  let referenceMinutes = weekMinutes(1)

  for (let week = 2; week <= context.requestedWeeks; week++) {
    const minutes = weekMinutes(week)
    // Recovery weeks are not compared with the build weeks
    if (minutes <= weekMinutes(week - 1) * recoveryLimit) continue

    const allowed = Math.max(
      referenceMinutes * increaseLimit,
      referenceMinutes + PLAN_RULES.maxWeeklyIncreaseMinutes
    )
    if (minutes > allowed && minutes <= allowed * overage) {
      for (const workout of plan.workouts) {
        if (workout.weekNumber === week && workout.discipline !== "REST") {
          scaleWorkout(workout, allowed / minutes)
        }
      }
      repairs.push(
        `Week ${week}: shortened from ${minutes} to ${weekMinutes(week)} minutes to keep the build gradual`
      )
    }
    referenceMinutes = weekMinutes(week)
  }

  return { plan, repairs }
}