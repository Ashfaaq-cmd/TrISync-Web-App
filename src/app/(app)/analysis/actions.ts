"use server"

import { revalidatePath } from "next/cache"
import { generateMonthlyInsight, MonthlyInsightError } from "@/lib/ai/monthly-generation"
import { MIN_MONTH_SESSIONS } from "@/lib/monthly-facts"
import { loadMonthlyFacts } from "@/lib/monthly-insight"
import { prisma } from "@/lib/prisma"
import { requireOnboardedUser } from "@/lib/session"

// A placeholder pause between attempts, so the free AI quota is not drained
const COOLDOWN_MS = 15 * 60 * 1000

export type MonthlySummaryState = { error?: string } | undefined

export async function generateMonthlySummary(
  _previousState: MonthlySummaryState
): Promise<MonthlySummaryState> {
  // The user always comes from the session, never from the form
  const { user } = await requireOnboardedUser()
  const now = new Date()

  const loaded = await loadMonthlyFacts(user.id, now)
  if (!loaded.facts) {
    return {
      error: `Not enough sessions yet: ${loaded.sessions} logged this month, and at least ${MIN_MONTH_SESSIONS} are needed.`,
    }
  }

  const where = {
    userId_periodStart: { userId: user.id, periodStart: loaded.monthStart },
  }

  const existing = await prisma.performanceInsight.findUnique({ where })
  if (existing) {
    const waitMs = existing.lastAttemptAt.getTime() + COOLDOWN_MS - now.getTime()
    if (waitMs > 0) {
      return { error: `Please wait ${Math.ceil(waitMs / 60000)} more minutes before updating again.` }
    }
  }

  // The attempt is counted before the AI is called
  await prisma.performanceInsight.upsert({
    where,
    create: {
      userId: user.id,
      periodStart: loaded.monthStart,
      periodEnd: loaded.today,
      lastAttemptAt: now,
    },
    update: { lastAttemptAt: now },
  })

  try {
    const result = await generateMonthlyInsight(loaded.facts)
    await prisma.performanceInsight.update({
      where,
      data: {
        periodEnd: loaded.today,
        headline: result.headline,
        summary: result.summary,
        suggestion: result.suggestion,
        facts: loaded.facts,
        aiModel: result.model,
        promptVersion: result.promptVersion,
      },
    })
  } catch (error) {
    if (error instanceof MonthlyInsightError) return { error: error.userMessage }
    console.error("Monthly summary failed:", (error as Error).message)
    return { error: "Something went wrong. Please try again." }
  }

  revalidatePath("/analysis")
}