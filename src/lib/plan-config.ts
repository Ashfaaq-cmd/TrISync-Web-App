import type { RaceGoal } from "@/generated/prisma"

// They are not medically validated prescriptions.
export const PLAN_LENGTHS: Record<RaceGoal, { min: number; default: number; max: number }> = {
  GENERAL_FITNESS: { min: 8, default: 8, max: 8 },
  SPRINT: { min: 8, default: 8, max: 10 },
  OLYMPIC: { min: 12, default: 12, max: 12 },
  HALF_IRONMAN: { min: 16, default: 16, max: 16 },
  IRONMAN: { min: 20, default: 20, max: 24 },
}

export const PLAN_RULES = {
  // Rule 3: the most a week's total time may grow compared with the last build week
  maxWeeklyIncreasePercent: 15,
  // Rule 4: a recovery week is at least this much lighter than the week before
  recoveryReductionPercent: 15,
  // Rule 4: the most build weeks in a row without a recovery week
  maxBuildWeeksInARow: 4,
  // Rule 8: with a race date, the final week must be this much lighter than the peak week
  taperReductionPercent: 25,
  // Rule 5: beginners do no brick sessions in these first weeks
  beginnerBrickFreeWeeks: 4,
  // Rule 7: limits on hard sessions
  maxHardSessionsPerWeek: 2,
  maxConsecutiveHardDays: 1,
  // Rule 1: a week must use at least this share of the chosen training days
  minTrainingDaysFraction: 0.5,
  // Rule 13: shortest accepted workout explanation, in characters
  minDescriptionLength: 20,
}