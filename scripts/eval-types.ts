export type PlanStats = {
  weeks: number
  workouts: number
  weeklyMinutes: number[]
  maxWorkoutMinutes: number
  brickSessions: number
  hardSessions: number
}

export type Rejected = { model: string; problems: string[] }

export type RunRecord = {
  promptVersion: string
  label: string
  scenarioId: string
  run: number
  startedAt: string
  primaryModel: string
  // UNAVAILABLE = the AI service was busy or down; ERROR = something else went wrong
  outcome: "SUCCESS" | "RULES_FAILED" | "UNAVAILABLE" | "ERROR"
  attempts: number
  repairs: number
  repairList: string[]
  model: string | null
  durationSec: number
  rejected: Rejected[]
  message: string | null
  plan: PlanStats | null
}