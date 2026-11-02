import { buildSamplePlan } from "../src/lib/sample-plan"
import { validatePlan, type PlanContext } from "../src/lib/plan-validator"
import type { TrainingPlanInput } from "../src/lib/validations/training-plan"

const context: PlanContext = {
  experienceLevel: "INTERMEDIATE",
  daysPerWeek: 6,
  minutesPerSession: 90,
  requestedWeeks: 4,
  hasRaceDate: false,
}

let total = 0
let failed = 0

function run(
  name: string,
  mutate: (plan: TrainingPlanInput) => void,
  expected: RegExp | "valid",
  overrides: Partial<PlanContext> = {}
) {
  const plan = structuredClone(buildSamplePlan())
  mutate(plan)
  const problems = validatePlan(plan, { ...context, ...overrides })

  const passed =
    expected === "valid"
      ? problems.length === 0
      : problems.some((problem) => expected.test(problem))

  total += 1
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}`)
  if (!passed) {
    failed += 1
    console.log("      problems found:", problems)
  }
}

run("the sample plan passes", () => {}, "valid")

run("workout over the session limit", (plan) => {
  plan.workouts[1].segments[0].targetDurationMin = 200
}, /minute limit/)

run("too many training days", (plan) => {
  plan.workouts[0] = { ...plan.workouts[2], dayOfWeek: 1 }
}, /training days/)

run("a missing week", (plan) => {
  plan.workouts = plan.workouts.filter((workout) => workout.weekNumber !== 3)
}, /exactly one workout/)

run("wrong plan length", () => {}, /must be 12 weeks/, { requestedWeeks: 12 })

run("a sudden jump in volume", (plan) => {
  for (const workout of plan.workouts.filter((w) => w.weekNumber === 2)) {
    for (const segment of workout.segments) {
      segment.targetDurationMin = Math.round((segment.targetDurationMin ?? 0) * 1.6)
    }
  }
}, /above week/, { minutesPerSession: 300 })

run("no recovery week", (plan) => {
  const week3 = plan.workouts.filter((workout) => workout.weekNumber === 3)
  plan.workouts = plan.workouts.filter((workout) => workout.weekNumber <= 3)
  for (const week of [4, 5, 6]) {
    plan.workouts.push(
      ...structuredClone(week3).map((workout) => ({ ...workout, weekNumber: week }))
    )
  }
  plan.totalWeeks = 6
}, /recovery week/, { requestedWeeks: 6 })

run("no taper before a race", (plan) => {
  const week3 = plan.workouts.filter((workout) => workout.weekNumber === 3)
  plan.workouts
    .filter((workout) => workout.weekNumber === 4)
    .forEach((workout, index) => {
      workout.segments = structuredClone(week3[index].segments)
    })
}, /final week/, { hasRaceDate: true })

run("a brick session for a beginner in week 1", () => {}, /brick/, {
  experienceLevel: "BEGINNER",
})

run("hard workouts on two days in a row", (plan) => {
  plan.workouts[1].segments[0].targetIntensity = "HARD"
  plan.workouts[2].segments[0].targetIntensity = "HARD"
}, /in a row/)

run("too many hard sessions in a week", (plan) => {
  for (const index of [1, 3, 5]) plan.workouts[index].segments[0].targetIntensity = "HARD"
}, /hard sessions/)

run("a week with no swim", (plan) => {
  plan.workouts[1].segments[0].discipline = "RUN"
}, /no swim session/)

run("a workout without an explanation", (plan) => {
  plan.workouts[2].description = "Run"
}, /explanation/)

console.log(`\n${total - failed} of ${total} checks passed`)
if (failed > 0) process.exitCode = 1