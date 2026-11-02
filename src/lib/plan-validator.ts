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
