import "dotenv/config"
import { GoogleGenAI } from "@google/genai"
import { z } from "zod"
import { trainingPlanSchema } from "../src/lib/validations/training-plan"

const apiKey = process.env.GEMINI_API_KEY ?? ""
// Usage: npm run ai:test-full -- <model>
const [model] = process.argv.slice(2)

const prompt =
  "Create a 12-week training plan for an intermediate triathlete preparing for an Olympic distance triathlon. " +
  "5 training days per week, at most 60 minutes per session. " +
  "Include rest days as REST workouts with no segments, so every week has exactly 7 days. " +
  "Increase volume gradually, include a lighter recovery week every fourth week and a short taper in the last week. " +
  "Include swim, bike, run and strength sessions, and brick sessions in the later weeks. " +
  "Explain each workout in one or two simple sentences."

async function main() {
  if (!apiKey || !model) throw new Error("Usage: npm run ai:test-full -- <model>")

  const ai = new GoogleGenAI({ apiKey })
  const startedAt = Date.now()

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: z.toJSONSchema(trainingPlanSchema),
      },
    })

    const seconds = Math.round((Date.now() - startedAt) / 1000)
    const usage = response.usageMetadata
    console.log(`${model} OK in ${seconds}s`)
    console.log(
      `output tokens: ${usage?.candidatesTokenCount}, thinking tokens: ${usage?.thoughtsTokenCount ?? 0}`
    )
    console.log("finish reason:", response.candidates?.[0]?.finishReason)

    const result = trainingPlanSchema.safeParse(JSON.parse(response.text ?? ""))
    if (!result.success) {
      console.log("Plan is NOT valid. First problems:")
      console.log(result.error.issues.slice(0, 5))
      return
    }

    const plan = result.data
    console.log(`Plan is valid: ${plan.totalWeeks} weeks, ${plan.workouts.length} workouts`)

    // A quick look at progression, week by week
    const weeks = new Map<number, { minutes: number; trainingDays: number }>()
    let longestSession = 0
    for (const workout of plan.workouts) {
      const minutes = workout.segments.reduce(
        (sum, segment) => sum + (segment.targetDurationMin ?? 0),
        0
      )
      longestSession = Math.max(longestSession, minutes)
      const entry = weeks.get(workout.weekNumber) ?? { minutes: 0, trainingDays: 0 }
      entry.minutes += minutes
      if (workout.discipline !== "REST") entry.trainingDays += 1
      weeks.set(workout.weekNumber, entry)
    }
    for (const [week, entry] of [...weeks].sort((a, b) => a[0] - b[0])) {
      console.log(`Week ${week}: ${entry.minutes} min, ${entry.trainingDays} training days`)
    }
    console.log(`Longest single workout: ${longestSession} min`)
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