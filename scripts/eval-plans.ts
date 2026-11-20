import "dotenv/config"
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import {
  generateTrainingPlan,
  PlanGenerationError,
  type GeneratePlanInput,
} from "../src/lib/ai/plan-generation"
import { PROMPT_VERSION } from "../src/lib/ai/plan-prompt"
import type { TrainingPlanInput } from "../src/lib/validations/training-plan"
import { SCENARIOS, type Scenario } from "./eval-scenarios"
import type { PlanStats, Rejected, RunRecord } from "./eval-types"

const RESULTS_DIR = join("evaluation", "results")
const PLANS_DIR = join("evaluation", "plans")
const STOP_AFTER_UNAVAILABLE = 3

function readArgs() {
  const args = process.argv.slice(2)
  const value = (name: string) => {
    const index = args.indexOf(`--${name}`)
    return index >= 0 ? args[index + 1] : undefined
  }

  return {
    runs: Number(value("runs") ?? 5),
    scenarioIds: value("scenarios")?.split(",").filter(Boolean) ?? null,
    pauseSeconds: Number(value("pause") ?? 15),
    // Used in the file name, so only letters, digits and dashes are kept
    label: (value("label") ?? "").replace(/[^a-z0-9-]/gi, ""),
    savePlans: args.includes("--save-plans"),
    list: args.includes("--list"),
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function planStats(plan: TrainingPlanInput): PlanStats {
  const weeklyMinutes: number[] = Array.from({ length: plan.totalWeeks }, () => 0)
  let maxWorkoutMinutes = 0
  let brickSessions = 0
  let hardSessions = 0

  for (const workout of plan.workouts) {
    const minutes = workout.segments.reduce(
      (sum, segment) => sum + (segment.targetDurationMin ?? 0),
      0
    )
    weeklyMinutes[workout.weekNumber - 1] += minutes
    maxWorkoutMinutes = Math.max(maxWorkoutMinutes, minutes)
    if (workout.discipline === "BRICK") brickSessions += 1
    if (workout.segments.some((segment) => segment.targetIntensity === "HARD")) {
      hardSessions += 1
    }
  }

  return {
    weeks: plan.totalWeeks,
    workouts: plan.workouts.length,
    weeklyMinutes,
    maxWorkoutMinutes,
    brickSessions,
    hardSessions,
  }
}

async function runOnce(
  scenario: Scenario,
  input: GeneratePlanInput,
  run: number,
  label: string
): Promise<{ record: RunRecord; plan: TrainingPlanInput | null }> {
  const startedAt = Date.now()
  const base = {
    promptVersion: PROMPT_VERSION,
    label,
    scenarioId: scenario.id,
    run,
    startedAt: new Date(startedAt).toISOString(),
    primaryModel: process.env.AI_MODEL ?? "",
  }
  const seconds = () => Math.round((Date.now() - startedAt) / 1000)

  try {
    const result = await generateTrainingPlan(input)
    const raw = result.aiRawOutput as {
      repairs: string[]
      rejectedAttempts: Rejected[]
    }

    return {
      record: {
        ...base,
        outcome: "SUCCESS",
        attempts: result.attempts,
        repairs: result.repairs,
        repairList: raw.repairs,
        model: result.aiModel,
        durationSec: seconds(),
        rejected: raw.rejectedAttempts,
        message: null,
        plan: planStats(result.plan),
      },
      plan: result.plan,
    }
  } catch (error) {
    const failure = {
      ...base,
      repairs: 0,
      repairList: [] as string[],
      model: null,
      durationSec: seconds(),
      plan: null,
    }

    if (error instanceof PlanGenerationError) {
      // attempts of 0 means it was refused before any AI call, for example a race date too close
      const outcome =
        error.attempts === 0 ? "ERROR" : error.temporary ? "UNAVAILABLE" : "RULES_FAILED"
      return {
        record: {
          ...failure,
          outcome,
          attempts: error.attempts,
          rejected: (error.rejectedAttempts as Rejected[] | undefined) ?? [],
          message: error.userMessage,
        },
        plan: null,
      }
    }

    return {
      record: {
        ...failure,
        outcome: "ERROR",
        attempts: 0,
        rejected: [],
        message: (error as Error).message,
      },
      plan: null,
    }
  }
}

async function main() {
  const options = readArgs()

  if (options.list) {
    for (const scenario of SCENARIOS) console.log(`${scenario.id}  ${scenario.label}`)
    return
  }

  if (!Number.isInteger(options.runs) || options.runs < 1 || options.runs > 30) {
    throw new Error("--runs must be a whole number from 1 to 30")
  }

  const chosen = options.scenarioIds
    ? SCENARIOS.filter((scenario) => options.scenarioIds?.includes(scenario.id))
    : SCENARIOS
  const unknown = (options.scenarioIds ?? []).filter(
    (id) => !SCENARIOS.some((scenario) => scenario.id === id)
  )
  if (unknown.length > 0 || chosen.length === 0) {
    throw new Error(`Unknown scenario: ${unknown.join(", ")}. Use --list to see them.`)
  }

  mkdirSync(RESULTS_DIR, { recursive: true })
  if (options.savePlans) mkdirSync(PLANS_DIR, { recursive: true })

  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")
  const file = join(
    RESULTS_DIR,
    `${PROMPT_VERSION}${options.label ? `-${options.label}` : ""}-${stamp}.jsonl`
  )

  const total = chosen.length * options.runs
  console.log(
    `Prompt ${PROMPT_VERSION}, model ${process.env.AI_MODEL}: ${total} runs (${chosen.length} scenarios x ${options.runs}). Results: ${file}\n`
  )

  let done = 0
  let busyInARow = 0

  // Run 1 of every scenario, then run 2 of every scenario, and so on
  for (let run = 1; run <= options.runs; run++) {
    for (const scenario of chosen) {
      done += 1
      const input = scenario.build()
      const { record, plan } = await runOnce(scenario, input, run, options.label)

      // Saved after every run, so nothing is lost if the script stops
      appendFileSync(file, `${JSON.stringify(record)}\n`)

      if (options.savePlans && plan) {
        const planFile = join(PLANS_DIR, `${PROMPT_VERSION}-${scenario.id}-${run}.json`)
        writeFileSync(
          planFile,
          JSON.stringify({ scenario: scenario.label, input, record, plan }, null, 2)
        )
      }

      console.log(
        `[${done}/${total}] ${scenario.id} #${run}: ${record.outcome} in ${record.durationSec}s, ` +
          `${record.attempts} attempts, ${record.repairs} repairs` +
          (record.model ? ` (${record.model})` : "")
      )

      busyInARow = record.outcome === "UNAVAILABLE" ? busyInARow + 1 : 0
      if (busyInARow >= STOP_AFTER_UNAVAILABLE) {
        console.log(
          `\nThe AI service was busy ${STOP_AFTER_UNAVAILABLE} times in a row. Stopping to save quota. Try again later.`
        )
        console.log(`Partial results are saved in ${file}`)
        return
      }

      if (done < total) await sleep(options.pauseSeconds * 1000)
    }
  }

  console.log(`\nDone. Results saved in ${file}`)
  console.log(`Summary: npm run eval:summary -- ${file}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})