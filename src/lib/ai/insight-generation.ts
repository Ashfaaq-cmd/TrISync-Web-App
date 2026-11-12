import { z } from "zod"
import { createGeminiProvider } from "@/lib/ai/gemini"
import { buildFacts, type InsightInput } from "@/lib/ai/insight-facts"
import {
  buildInsightPrompt,
  INSIGHT_PROMPT_VERSION,
  INSIGHT_SYSTEM_PROMPT,
} from "@/lib/ai/insight-prompt"
import { AiUnavailableError, type AiProvider } from "@/lib/ai/provider"
import { insightSchema, type StoredInsight } from "@/lib/validations/workout-insight"
import { findInventedNumbers, numbersIn } from "@/lib/ai/number-check"

const MAX_ATTEMPTS = 2
const TIME_BUDGET_MS = 90_000

export class InsightError extends Error {
  userMessage: string

  constructor(userMessage: string) {
    super(userMessage)
    this.name = "InsightError"
    this.userMessage = userMessage
  }
}
// Valid JSON, the right shape, and no numbers that were not in the facts
function checkInsight(text: string, allowedNumbers: Set<string>) {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return { problem: "The answer was not valid JSON" }
  }

  const parsed = insightSchema.safeParse(json)
  if (!parsed.success) {
    return { problem: parsed.error.issues.map((issue) => issue.message).join("; ") }
  }

  const { headline, details, suggestion } = parsed.data
  const invented = findInventedNumbers(
    `${headline} ${details} ${suggestion}`,
    allowedNumbers
  )
  if (invented.length > 0) {
    return { problem: `It used numbers that are not in the facts: ${invented.join(", ")}` }
  }

  return { insight: parsed.data }
}

export async function generateInsight(
  input: InsightInput,
  provider: AiProvider = createGeminiProvider()
): Promise<StoredInsight> {
  const facts = buildFacts(input)
  const allowedNumbers = new Set(numbersIn(facts.join(" ")))
  const jsonSchema = z.toJSONSchema(insightSchema)
  const deadline = Date.now() + TIME_BUDGET_MS
  const basePrompt = buildInsightPrompt(facts)

  let prompt = basePrompt
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let result
    try {
      result = await provider.generateJson({
        system: INSIGHT_SYSTEM_PROMPT,
        prompt,
        jsonSchema,
        deadline,
      })
    } catch (error) {
      if (error instanceof AiUnavailableError) {
        throw new InsightError(
          "The AI service is busy right now. Please try again in a few minutes."
        )
      }
      // The message only: never the prompt, the key or personal data
      console.error("AI provider error:", (error as Error).message)
      throw new InsightError(
        "Feedback could not be generated because of a service problem. Please try again later."
      )
    }

    const checked = checkInsight(result.text, allowedNumbers)
    if (checked.insight) {
      return {
        ...checked.insight,
        model: result.model,
        promptVersion: INSIGHT_PROMPT_VERSION,
      }
    }

    prompt = `${basePrompt}\n\nYour previous answer had this problem: ${checked.problem}. Write the feedback again and fix it.`
  }

  throw new InsightError(
    "We could not produce reliable feedback for this session. Please try again."
  )
}