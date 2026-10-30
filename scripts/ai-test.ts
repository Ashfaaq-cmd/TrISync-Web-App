import "dotenv/config"
import { GoogleGenAI } from "@google/genai"
import { z } from "zod"
import { trainingPlanSchema } from "../src/lib/validations/training-plan"

const apiKey = process.env.GEMINI_API_KEY ?? ""
const model = process.env.AI_MODEL ?? ""

if (!apiKey || !model) {
  console.error("Set GEMINI_API_KEY and AI_MODEL in .env first")
  process.exit(1)
}

const ai = new GoogleGenAI({ apiKey })

async function main() {
  // Test 1: can we reach the model and get JSON back?
  const hello = await ai.models.generateContent({
    model,
    contents: "Reply with a short greeting.",
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(z.object({ greeting: z.string() })),
    },
  })
  console.log("Test 1 response:", hello.text)

  // Test 2: does the model accept our real plan schema?
  const startedAt = Date.now()
  const response = await ai.models.generateContent({
    model,
    contents:
      "Create a 1-week triathlon training plan for a beginner training for a sprint triathlon. " +
      "3 training days, at most 45 minutes per session. Explain each workout in simple language.",
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(trainingPlanSchema),
    },
  })
  console.log(`Test 2 took ${Math.round((Date.now() - startedAt) / 1000)} seconds`)
  console.log("Tokens used:", response.usageMetadata)

  const result = trainingPlanSchema.safeParse(JSON.parse(response.text ?? ""))
  console.log(
    result.success
      ? `Plan is valid: ${result.data.workouts.length} workouts`
      : result.error.issues
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})