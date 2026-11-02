import "dotenv/config"
import { GoogleGenAI } from "@google/genai"

const apiKey = process.env.GEMINI_API_KEY ?? ""

if (!apiKey) {
  console.error("Set GEMINI_API_KEY in .env first")
  process.exit(1)
}

const ai = new GoogleGenAI({ apiKey })

async function main() {
  const models = await ai.models.list()

  for await (const model of models) {
    // Only show models that can generate text
    const actions = model.supportedActions
    if (actions && !actions.includes("generateContent")) continue

    console.log(`${model.name?.replace("models/", "")}  (${model.displayName ?? ""})`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})