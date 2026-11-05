import { GoogleGenAI } from "@google/genai"
import { AiUnavailableError, type AiProvider } from "@/lib/ai/provider"

const RETRY_DELAYS_MS = [2000, 6000]
const REQUEST_TIMEOUT_MS = 60_000

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Overloaded / rate limit / slow calls are worth trying again
function isTemporary(error: unknown) {
  const status = (error as { status?: number }).status
  if (status === 429 || status === 500 || status === 503 || status === 504) return true
  const name = (error as { name?: string }).name
  return name === "TimeoutError" || name === "AbortError"
}

export function createGeminiProvider(): AiProvider {
  return {
    async generateJson({ system, prompt, jsonSchema, deadline }) {
      // Read the settings when called, never when the file is loaded
      const apiKey = process.env.GEMINI_API_KEY
      const models = [process.env.AI_MODEL, process.env.AI_FALLBACK_MODEL].filter(
        (name): name is string => Boolean(name)
      )
      if (!apiKey || models.length === 0) throw new Error("AI is not configured")

      const ai = new GoogleGenAI({ apiKey })

      for (const model of models) {
        for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
          if (Date.now() > deadline) throw new AiUnavailableError()

          try {
            const response = await ai.models.generateContent({
              model,
              contents: prompt,
              config: {
                systemInstruction: system,
                responseMimeType: "application/json",
                responseJsonSchema: jsonSchema,
                abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
              },
            })
            if (response.text) return { text: response.text, model }
            // empty answer treated like temporary failure
          } catch (error) {
            // A retired model will never work, so go to the next one
            if ((error as { status?: number }).status === 404) break
            if (!isTemporary(error)) throw error
          }

          if (attempt < RETRY_DELAYS_MS.length) await sleep(RETRY_DELAYS_MS[attempt])
        }
      }
      
      throw new AiUnavailableError()
    },
  }
}