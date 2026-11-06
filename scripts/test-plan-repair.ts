import { buildSamplePlan } from "../src/lib/sample-plan"
import { repairPlan } from "../src/lib/plan-repair"
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

function check(name: string, passed: boolean, details?: unknown) {
  total += 1
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}`)
  if (!passed) {
    failed += 1
    console.log("      details:", details)
  }
}

function runRepair(
  mutate: (plan: TrainingPlanInput) => void,
  overrides: Partial<PlanContext> = {}
) {
  const plan = structuredClone(buildSamplePlan())
  mutate(plan)
  const fullContext = { ...context, ...overrides }
  const repaired = repairPlan(plan, fullContext)
  return { ...repaired, problems: validatePlan(repaired.plan, fullContext) }
}

// A valid plan is left alone
const untouched = repairPlan(buildSamplePlan(), context)
check(
  "a valid plan is not changed",
  untouched.repairs.length === 0 &&
    JSON.stringify(untouched.plan) === JSON.stringify(buildSamplePlan()),
  untouched.repairs
)

// A small overage is shortened
const small = runRepair((plan) => {
  const brick = plan.workouts.find((w) => w.discipline === "BRICK" && w.weekNumber === 1)!
  brick.segments[0].targetDurationMin = 50
  brick.segments[1].targetDurationMin = 45
})
check(
  "a small overage in one workout is shortened",
  small.repairs.length > 0 && !small.problems.some((p) => /minute limit/.test(p)),
  small
)

// A large overage is left for the AI
const large = runRepair((plan) => {
  const brick = plan.workouts.find((w) => w.discipline === "BRICK" && w.weekNumber === 1)!
  brick.segments[0].targetDurationMin = 100
  brick.segments[1].targetDurationMin = 100
})
check(
  "a large overage is left for the AI to fix",
  large.problems.some((p) => /minute limit/.test(p)),
  large.problems
)

// Hard days in a row
const hard = runRepair((plan) => {
  plan.workouts[1].segments[0].targetIntensity = "HARD"
  plan.workouts[2].segments[0].targetIntensity = "HARD"
})
check(
  "hard workouts on two days in a row are softened",
  hard.repairs.some((r) => /hard to moderate/.test(r)) &&
    !hard.problems.some((p) => /in a row/.test(p)),
  hard
)

// A week growing too fast
const jump = runRepair(
  (plan) => {
    for (const workout of plan.workouts.filter((w) => w.weekNumber === 2)) {
      for (const segment of workout.segments) {
        segment.targetDurationMin = Math.round((segment.targetDurationMin ?? 0) * 1.1)
      }
    }
  },
  { minutesPerSession: 300 }
)
check(
  "a week growing too fast is scaled down",
  jump.repairs.some((r) => /gradual/.test(r)) &&
    !jump.problems.some((p) => /above week/.test(p)),
  jump
)

// An incomplete plan cannot be repaired
const incomplete = runRepair((plan) => {
  plan.workouts = plan.workouts.filter((w) => w.weekNumber !== 3)
})
check(
  "an incomplete plan is not repaired",
  incomplete.repairs.length === 0 && incomplete.problems.length > 0,
  incomplete
)

console.log(`\n${total - failed} of ${total} checks passed`)
if (failed > 0) process.exitCode = 1