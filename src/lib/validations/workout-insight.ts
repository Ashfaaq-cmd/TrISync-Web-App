import { z } from "zod"
// What the AI must return
export const insightSchema = z.object({
    headline: z.string().min(5).max(100),
    details: z.string().min(20).max(500),
    suggestion: z.string().min(10).max(250),
}) 
// What is saved with the log: insight + where it came from
export const storedInsightSchema = insightSchema.extend({
    model: z.string(),
    promptVersion: z.string(),
})

export type StoredInsight = z.infer<typeof storedInsightSchema>