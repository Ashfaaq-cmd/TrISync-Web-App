"use server"

import { revalidatePath } from "next/cache"
import type { Prisma } from "@/generated/prisma"
import { generateInsight, InsightError } from "@/lib/ai/insight-generation"
import { prisma } from "@/lib/prisma"
import { requireOnboardedUser } from "@/lib/session"
import { getInsightInput } from "@/lib/workout-insight"

// Placeholder limit on attempts per user per day
const DAILY_LIMIT = 20

export type InsightState = { error?: string } | undefined

export async function requestInsight(
  _previousState: InsightState,
  formData: FormData
): Promise<InsightState> {
  // The user always comes from the session, never from the form
  const { user } = await requireOnboardedUser()
  const logId = String(formData.get("logId") ?? "")

  // Only returns data if this log belongs to this user
  const found = await getInsightInput(user.id, logId)
  if (!found) return { error: "That session was not found" }
  if (found.hasInsight) return { error: "This session already has feedback" }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const used = await prisma.workoutLog.count({
    where: { userId: user.id, aiInsightAt: { gte: since } },
  })
  if (used >= DAILY_LIMIT) {
    return { error: "You have reached today's limit for AI feedback. Please try again tomorrow." }
  }

  // The attempt is counted before the AI is called
  await prisma.workoutLog.updateMany({
    where: { id: logId, userId: user.id },
    data: { aiInsightAt: new Date() },
  })

  try {
    const insight = await generateInsight(found.input)
    await prisma.workoutLog.updateMany({
      where: { id: logId, userId: user.id },
      data: { aiInsight: insight as Prisma.InputJsonValue },
    })
  } catch (error) {
    if (error instanceof InsightError) return { error: error.userMessage }
    console.error("Insight failed:", (error as Error).message)
    return { error: "Something went wrong. Please try again." }
  }

  revalidatePath("/log-workout")
}