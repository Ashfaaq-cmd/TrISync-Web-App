import { z } from "zod"
import { createGeminiProvider } from "@/lib/ai/gemini"
import { MONTHLY_PROMPT_VERSION, MONTHLY_SYSTEM_PROMPT, buildMonthlyPrompt } from "@/lib/ai/monthly-prompt"
import { findInventedNumbers, numbersIn } from "@/lib/ai/number-check"
import { AiUnavailableError, type AiProvider } from "@/lib/ai/provider"
import { monthlyInsightSchema } from "@/lib/validations/monthly-insight"

const MAX_ATTEMPTS = 2
const TIME_BUDGET_MS = 90_000

export class MonthlyInsightError extends Error {
  userMessage: string

  constructor(userMessage: string) {
    super(userMessage)
    this.name = "MonthlyInsightError"
    this.userMessage = userMessage
  }
}

// Valid JSON, the right shape, and no numbers that were not in the facts
function checkSummary(text: string, allowedNumbers: Set<string>) {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return { problem: "The answer was not valid JSON" }
  }

  const parsed = monthlyInsightSchema.safeParse(json)
  if (!parsed.success) {
    return { problem: parsed.error.issues.map((issue) => issue.message).join("; ") }
  }

  const { headline, summary, suggestion } = parsed.data
  const invented = findInventedNumbers(`${headline} ${summary} ${suggestion}`, allowedNumbers)
  if (invented.length > 0) {
    return { problem: `It used numbers that are not in the facts: ${invented.join(", ")}` }
  }

  return { content: parsed.data }
}

export async function generateMonthlyInsight(
  facts: string[],
  provider: AiProvider = createGeminiProvider()
) {
  const allowedNumbers = new Set(numbersIn(facts.join(" ")))
  const jsonSchema = z.toJSONSchema(monthlyInsightSchema)
  const deadline = Date.now() + TIME_BUDGET_MS
  const basePrompt = buildMonthlyPrompt(facts)

  let prompt = basePrompt
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let result
    try {
      result = await provider.generateJson({
        system: MONTHLY_SYSTEM_PROMPT,
        prompt,
        jsonSchema,
        deadline,
      })
    } catch (error) {
      if (error instanceof AiUnavailableError) {
        throw new MonthlyInsightError(
          "The AI service is busy right now. Please try again in a few minutes."
        )
      }
      // The message only: never the prompt, the key or personal data
      console.error("AI provider error:", (error as Error).message)
      throw new MonthlyInsightError(
        "The summary could not be generated because of a service problem. Please try again later."
      )
    }

    const checked = checkSummary(result.text, allowedNumbers)
    if (checked.content) {
      return { ...checked.content, model: result.model, promptVersion: MONTHLY_PROMPT_VERSION }
    }

    prompt = `${basePrompt}\n\nYour previous answer had this problem: ${checked.problem}. Write the summary again and fix it.`
  }

  throw new MonthlyInsightError(
    "We could not produce a reliable summary this time. Please try again."
  )
}