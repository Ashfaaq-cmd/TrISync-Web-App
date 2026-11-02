import "dotenv/config"
import { GoogleGenAI } from "@google/genai"
import type { ThinkingLevel } from "@google/genai"
import { z } from "zod"
import { trainingPlanSchema } from "../src/lib/validations/training-plan"

const apiKey = process.env.GEMINI_API_KEY ?? ""
// Usage: npm run ai:test -- <model> [thinking level]
const [model, thinkingLevel] = process.argv.slice(2)

async function main() {
  if (!apiKey || !model) {
    throw new Error("Usage: npm run ai:test -- <model> [minimal|low|medium|high]")
  }

  const ai = new GoogleGenAI({ apiKey })
  const startedAt = Date.now()

  try {
    const response = await ai.models.generateContent({
      model,
      contents:
        "Create a 1-week triathlon training plan for a beginner training for a sprint triathlon. " +
        "3 training days, at most 45 minutes per session. Explain each workout in simple language.",
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: z.toJSONSchema(trainingPlanSchema),
        ...(thinkingLevel
          ? { thinkingConfig: { thinkingLevel: thinkingLevel.toUpperCase() as ThinkingLevel } }
          : {}),
      },
    })

    const seconds = Math.round((Date.now() - startedAt) / 1000)
    const usage = response.usageMetadata
    console.log(`${model} (thinking: ${thinkingLevel ?? "default"}) OK in ${seconds}s`)
    console.log(
      `output tokens: ${usage?.candidatesTokenCount}, thinking tokens: ${usage?.thoughtsTokenCount ?? 0}`
    )

    const result = trainingPlanSchema.safeParse(JSON.parse(response.text ?? ""))
    console.log(
      result.success
        ? `Plan is valid: ${result.data.workouts.length} workouts`
        : result.error.issues
    )
  } catch (error) {
    const seconds = Math.round((Date.now() - startedAt) / 1000)
    const status = (error as { status?: number }).status
    console.log(`${model} FAILED after ${seconds}s (status ${status})`)
    console.log((error as Error).message)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})