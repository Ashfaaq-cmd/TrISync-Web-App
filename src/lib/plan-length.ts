import type { RaceGoal } from "@/generated/prisma"
import { nextMonday } from "@/lib/dates"
import { MIN_PLAN_WEEKS, PLAN_LENGTHS } from "@/lib/plan-config"

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

export type PlanLength = { weeks: number; useRaceDate: boolean } | { error: string }

export function choosePlanLength(
  goal: RaceGoal,
  targetRaceDate: Date | null,
  now = new Date()
): PlanLength {
  const config = PLAN_LENGTHS[goal]
  if (!targetRaceDate) return { weeks: config.default, useRaceDate: false }

  // The race week is the last week of the plan
  const start = nextMonday(now)
  const weeksToRace =
    Math.floor((targetRaceDate.getTime() - start.getTime()) / MS_PER_WEEK) + 1

  if (weeksToRace < MIN_PLAN_WEEKS) {
    return {
      error: `Your race date is too close for a training plan (at least ${MIN_PLAN_WEEKS} weeks are needed). Update your race date on your profile.`,
    }
  }
  // Race is far away: build a standard plan without a taper
  if (weeksToRace > config.max) return { weeks: config.default, useRaceDate: false }

  return { weeks: weeksToRace, useRaceDate: true }
}