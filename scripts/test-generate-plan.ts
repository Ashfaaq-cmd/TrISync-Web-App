import "dotenv/config"
import {
  generateTrainingPlan,
  PlanGenerationError,
  type GeneratePlanInput,
} from "../src/lib/ai/plan-generation"

// A race date about nine weeks from now, as a plain UTC date
const inNineWeeks = new Date(Date.now() + 63 * 24 * 60 * 60 * 1000)
const raceDate = new Date(
  Date.UTC(inNineWeeks.getUTCFullYear(), inNineWeeks.getUTCMonth(), inNineWeeks.getUTCDate())
)

const scenarios: GeneratePlanInput[] = [
  { experienceLevel: "INTERMEDIATE", goal: "OLYMPIC", daysPerWeek: 5, minutesPerSession: 60, targetRaceDate: null, isUnwell: false },
  { experienceLevel: "BEGINNER", goal: "SPRINT", daysPerWeek: 3, minutesPerSession: 45, targetRaceDate: raceDate, isUnwell: false },
  { experienceLevel: "ADVANCED", goal: "HALF_IRONMAN", daysPerWeek: 6, minutesPerSession: 120, targetRaceDate: null, isUnwell: true },
]

async function main() {
  const choice = Number(process.argv[2] ?? "1")
  const scenario = scenarios[choice - 1]
  if (!scenario) throw new Error("Usage: npm run ai:test-plan -- <1, 2 or 3>")

  console.log("Scenario", choice, scenario)
  const startedAt = Date.now()

  try {
    const result = await generateTrainingPlan(scenario)
    const seconds = Math.round((Date.now() - startedAt) / 1000)
        const raw = result.aiRawOutput as {
      attempts: number
      repairs: string[]
      rejectedAttempts: { model: string; problems: string[] }[]
    }

    console.log(`\nSUCCESS in ${seconds}s with ${result.aiModel}, prompt ${result.aiPromptVersion}`)
    console.log(`Attempts needed: ${raw.attempts}`)
    console.log(`Repairs made in code: ${raw.repairs.length}`)
    raw.repairs.slice(0, 6).forEach((repair) => console.log("  -", repair))
    raw.rejectedAttempts.forEach((attempt, index) => {
      console.log(
        `Attempt ${index + 1} (${attempt.model}) was rejected, ${attempt.problems.length} problems:`
      )
      attempt.problems.slice(0, 5).forEach((problem) => console.log("  -", problem))
    })

    const weeks = new Map<number, { minutes: number; days: number }>()
    for (const workout of result.plan.workouts) {
      const entry = weeks.get(workout.weekNumber) ?? { minutes: 0, days: 0 }
      entry.minutes += workout.segments.reduce((sum, s) => sum + (s.targetDurationMin ?? 0), 0)
      if (workout.discipline !== "REST") entry.days += 1
      weeks.set(workout.weekNumber, entry)
    }
    console.log(`\n${result.plan.title}: ${result.plan.totalWeeks} weeks`)
    for (const [week, entry] of [...weeks].sort((a, b) => a[0] - b[0])) {
      console.log(`Week ${week}: ${entry.minutes} min, ${entry.days} training days`)
    }
  } catch (error) {
    if (error instanceof PlanGenerationError) {
      console.log(`\nFAILED (${error.temporary ? "temporary" : "permanent"}): ${error.userMessage}`)
    } else {
      throw error
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})