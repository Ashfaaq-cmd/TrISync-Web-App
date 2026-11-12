import { z } from "zod"

// What the AI must return
export const monthlyInsightSchema = z.object({
  headline: z.string().min(5).max(100),
  summary: z.string().min(60).max(800),
  suggestion: z.string().min(10).max(250),
})

// The facts are saved with the summary, so it can be checked later
export const storedFactsSchema = z.array(z.string())