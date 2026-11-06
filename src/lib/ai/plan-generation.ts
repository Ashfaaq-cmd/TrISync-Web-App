import { z } from "zod"
import type { ExperienceLevel, RaceGoal } from "@/generated/prisma"
import { createGeminiProvider } from "@/lib/ai/gemini"
import {
  buildPlanPrompt,
  PROMPT_VERSION,
  SYSTEM_PROMPT,
  type RecentTraining,
} from "@/lib/ai/plan-prompt"
import { AiUnavailableError, type AiProvider } from "@/lib/ai/provider"
import { choosePlanLength } from "@/lib/plan-length"
import { validatePlan, type PlanContext } from "@/lib/plan-validator"
import {
  trainingPlanSchema,
  type TrainingPlanInput,
} from "@/lib/validations/training-plan"
import { formatEnum } from "@/lib/discipline"
import { repairPlan } from "@/lib/plan-repair"

const MAX_ATTEMPTS = 4
const TOTAL_TIME_BUDGET_MS = 240_000
const MAX_PROBLEMS = 15

export type GeneratePlanInput = {
  experienceLevel: ExperienceLevel
  goal: RaceGoal
  daysPerWeek: number
  minutesPerSession: number
  targetRaceDate: Date | null
  isUnwell: boolean
  recentTraining?: RecentTraining
}

export type GeneratedPlan = {
  plan: TrainingPlanInput
  aiRawOutput: unknown
  aiModel: string
  aiPromptVersion: string
}

// UserMessage safe to show to the user; retry later
export class PlanGenerationError extends Error{
    userMessage: string
    temporary: boolean

    constructor(userMessage: string, temporary = false) {
    super(userMessage)
    this.name = "PlanGenerationError"
    this.userMessage = userMessage
    this.temporary = temporary
  }
}
// Check the AI's answer: valid JSON, right shape, then the coaching rules
function checkAnswer(text: string, context: PlanContext, goal: RaceGoal) {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return { problems: ["The answer was not valid JSON"] }
  }

  const parsed = trainingPlanSchema.safeParse(json)
  if (!parsed.success) {
    return {
      problems: parsed.error.issues
        .slice(0, MAX_PROBLEMS)
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`),
    }
  }

  // We know the athlete's goal, so we do not rely on the AI for it
  const plan = { ...parsed.data, goal, title: `${parsed.data.totalWeeks}-week ${formatEnum(goal)} plan`, }
    // Small overshoots are fixed in code. The AI's own answer is kept in json.
  const repaired = repairPlan(plan, context)
  return {
    plan: repaired.plan,
    repairs: repaired.repairs,
    json,
    problems: validatePlan(repaired.plan, context).slice(0, MAX_PROBLEMS),
  }
}

export async function generateTrainingPlan(
  input: GeneratePlanInput,
  provider: AiProvider = createGeminiProvider(),
  now = new Date()
): Promise<GeneratedPlan> {
  const length = choosePlanLength(input.goal, input.targetRaceDate, now)
  if ("error" in length) throw new PlanGenerationError(length.error)

  const context: PlanContext = {
    experienceLevel: input.experienceLevel,
    daysPerWeek: input.daysPerWeek,
    minutesPerSession: input.minutesPerSession,
    requestedWeeks: length.weeks,
    hasRaceDate: length.useRaceDate,
    isUnwell: input.isUnwell,
  }

  const basePrompt = buildPlanPrompt({
    experienceLevel: input.experienceLevel,
    goal: input.goal,
    daysPerWeek: input.daysPerWeek,
    minutesPerSession: input.minutesPerSession,
    weeks: length.weeks,
    useRaceDate: length.useRaceDate,
    isUnwell: input.isUnwell,
    recentTraining: input.recentTraining,
  })
  const jsonSchema = z.toJSONSchema(trainingPlanSchema)
  const deadline = Date.now() + TOTAL_TIME_BUDGET_MS

  let prompt = basePrompt
  // Kept with the plan, as evidence of how often the AI needed correcting
  const rejectedAttempts: { model: string; problems: string[] }[] = []

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let result
    try {
      result = await provider.generateJson({
        system: SYSTEM_PROMPT,
        prompt,
        jsonSchema,
        deadline,
      })
    } catch (error) {
      if (error instanceof AiUnavailableError) {
        throw new PlanGenerationError(
          "The AI service is busy right now. Please try again in a few minutes.",
          true
        )
      }
      // Log the message only: never the prompt, the key or personal data
      console.error("AI provider error:", (error as Error).message)
      throw new PlanGenerationError(
        "The plan could not be generated because of a service problem. Please try again later.",
        true
      )
    }

    const checked = checkAnswer(result.text, context, input.goal)

    if (checked.plan && checked.problems.length === 0) {
      return {
        plan: checked.plan,
        aiRawOutput: { attempts: attempt, repairs: checked.repairs, rejectedAttempts, response: checked.json },
        aiModel: result.model,
        aiPromptVersion: PROMPT_VERSION,
      }
    }

    rejectedAttempts.push({ model: result.model, problems: checked.problems })
    prompt =
      `${basePrompt}\n\nYour previous answer broke these rules:\n` +
      checked.problems.map((problem) => `- ${problem}`).join("\n") +
      `\n\nWrite the whole plan again from week 1 to week ${length.weeks}, all ${length.weeks * 7} workouts, with these problems fixed. Do not return only the corrected parts.`
  }

  console.error("Plan failed the training rules after all attempts:", rejectedAttempts)
  throw new PlanGenerationError(
    "We could not build a plan that meets our training rules this time. Please try again."
  )
}