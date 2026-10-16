import { z } from "zod"

export const EXPERIENCE_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const

export const RACE_GOALS = ["SPRINT","OLYMPIC","HALF_IRONMAN","IRONMAN","GENERAL_FITNESS"] as const

export const onboardingSchema = z.object({
  experienceLevel: z.enum(EXPERIENCE_LEVELS, "Please select your experience level"),
  raceGoal: z.enum(RACE_GOALS, "Please select your race goal"),
  daysPerWeek: z.coerce.number().int().min(2, "Please choose how many days you can train").max(7, "Please choose how many days you can train"),
  minutesPerSession: z.coerce.number().int().min(20, "Please choose your session length").max(300, "Please choose your session length"),
  targetRaceDate: z.coerce.date().refine((date) => date > new Date(), "Race date must be in the future").optional(),
})
    