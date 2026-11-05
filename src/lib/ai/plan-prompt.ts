import type { ExperienceLevel, RaceGoal } from "@/generated/prisma"
import { PLAN_RULES } from "@/lib/plan-config"
import { MUSCLE_GROUPS } from "@/lib/validations/training-plan"

// Change this whenever the prompt changes, so plans can be compared by version
export const PROMPT_VERSION = "v1"

export type RecentTraining = {
  weeks: number
  sessions: number
  minutesByDiscipline: Record<string, number>
}

export type PromptInput = {
  experienceLevel: ExperienceLevel
  goal: RaceGoal
  daysPerWeek: number
  minutesPerSession: number
  weeks: number
  useRaceDate: boolean
  isUnwell: boolean
  recentTraining?: RecentTraining
}

export const SYSTEM_PROMPT =
  "You are an experienced triathlon coach writing training plans for amateur athletes. " +
  "Reply with JSON only, matching the schema you are given. " +
  "Write in plain English that a beginner can understand. " +
  "The plan is general guidance, not medical advice."

export function buildPlanPrompt(input: PromptInput) {
  const minTrainingDays = Math.ceil(input.daysPerWeek * PLAN_RULES.minTrainingDaysFraction)

  const athlete = [
    `- Experience level: ${input.experienceLevel}`,
    `- Goal: ${input.goal} (use exactly this value for "goal")`,
    `- Training days per week: at most ${input.daysPerWeek}`,
    `- Maximum length of one workout: ${input.minutesPerSession} minutes`,
    `- Plan length: ${input.weeks} weeks (weekNumber 1 to ${input.weeks})`,
  ]

  if (input.recentTraining) {
    const { weeks, sessions, minutesByDiscipline } = input.recentTraining
    const parts = Object.entries(minutesByDiscipline).map(
      ([discipline, minutes]) => `${discipline.toLowerCase()} ${minutes} min`
    )
    athlete.push(
      `- Recent training (last ${weeks} weeks): ${sessions} sessions logged (${parts.join(", ") || "no time logged"}). Use this to judge the starting load and do not start much higher.`
    )
  }

  if (input.isUnwell) {
    athlete.push(
      "- Health note: the athlete reports being ill, injured or very tired. Start gently: no HARD sessions in weeks 1 and 2, keep week 1 light and build slowly. In the first workout descriptions, tell them to rest and see a doctor or physiotherapist if symptoms continue."
    )
  }

  const rules = [
    `Every week has exactly 7 workouts, one for each dayOfWeek from 1 (Monday) to 7 (Sunday). Rest days use discipline "REST" with no segments and no muscleGroups.`,
    `Use at least ${minTrainingDays} and at most ${input.daysPerWeek} training days (non-REST) in every week.`,
    `The total of all segment durations in one workout must not exceed ${input.minutesPerSession} minutes. Every non-REST segment needs targetDurationMin and targetIntensity.`,
    `targetIntensity is EASY (conversational), MODERATE (steady, comfortably hard) or HARD (intervals, threshold or race pace).`,
    `Increase the weekly total training time gradually: no week may be more than ${PLAN_RULES.maxWeeklyIncreasePercent}% above the previous build week.`,
    `Include a recovery week at least every ${PLAN_RULES.maxBuildWeeksInARow} weeks, with a total at least ${PLAN_RULES.recoveryReductionPercent}% lower than the week before it.`,
    `At most ${PLAN_RULES.maxHardSessionsPerWeek} workouts per week may include a HARD segment, and never on two days in a row (also not across two weeks).`,
    `Include swimming, cycling and running in every week (a BRICK counts as cycling and running). Balance them for the goal.`,
    `A BRICK workout has two or more segments, for example BIKE then RUN.${
      input.experienceLevel === "BEGINNER"
        ? ` Beginners must have no BRICK workouts in weeks 1 to ${PLAN_RULES.beginnerBrickFreeWeeks}.`
        : " Experienced athletes may include bricks earlier."
    }`,
    input.useRaceDate
      ? `The final week is race week. Taper: its total training time must be at least ${PLAN_RULES.taperReductionPercent}% lower than the peak week. Do not schedule the race itself.`
      : `There is no race date, so no taper is needed.`,
    `Vary the sessions: endurance, technique, intervals, strength and recovery, as suitable for the level and goal.`,
    `Segment disciplines are SWIM, BIKE, RUN or STRENGTH. The workout discipline may also be BRICK or REST. Distances are optional and in kilometres (a 1500 m swim is 1.5).`,
    `Every non-REST workout needs a title, a one or two sentence description explaining its purpose in simple language, and at least one muscleGroup from: ${MUSCLE_GROUPS.join(", ")}.`,
  ]

  return [
    `Create a triathlon training plan for this athlete.`,
    ``,
    `Athlete:`,
    ...athlete,
    ``,
    `Rules the plan must follow:`,
    ...rules.map((rule, index) => `${index + 1}. ${rule}`),
  ].join("\n")
}