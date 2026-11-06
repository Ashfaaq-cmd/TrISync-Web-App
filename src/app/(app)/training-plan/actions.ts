"use server"

import { revalidatePath } from "next/cache"
import type { Prisma } from "@/generated/prisma"
import { generateTrainingPlan, PlanGenerationError } from "@/lib/ai/plan-generation"
import { PROMPT_VERSION } from "@/lib/ai/plan-prompt"
import { prisma } from "@/lib/prisma"
import { requireOnboardedUser } from "@/lib/session"
import { saveTrainingPlan } from "@/lib/training-plan"
import { getRecentTraining } from "@/lib/workout-log"

// Counts every real attempt except ones where the AI service itself was down
const DAILY_LIMIT = 5
// Keep the new model delegate usable if this environment's generated Prisma
// client types have not yet been refreshed.
const planGenerationLog = (prisma as unknown as {
  planGenerationLog: {
    count: (args: {
      where: {
        userId: string
        createdAt: { gte: Date }
        outcome: { not: string }
      }
    }) => Promise<number>
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>
  }
}).planGenerationLog

export type GeneratePlanState = { error?: string } | undefined

export async function generatePlan(
  _previousState: GeneratePlanState,
  formData: FormData
): Promise<GeneratePlanState> {
  // The user and their profile come from the session, never from the form
  const { user, profile } = await requireOnboardedUser()

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const used = await planGenerationLog.count({
    where: { userId: user.id, createdAt: { gte: since }, outcome: { not: "UNAVAILABLE" } },
  })
  if (used >= DAILY_LIMIT) {
    return {
      error: `You have reached today's limit of ${DAILY_LIMIT} plan generations. Please try again tomorrow.`,
    }
  }

  const startedAt = Date.now()

  try {
    const result = await generateTrainingPlan({
      experienceLevel: profile.experienceLevel,
      goal: profile.goal,
      daysPerWeek: profile.daysPerWeek,
      minutesPerSession: profile.minutesPerSession ?? 60,
      targetRaceDate: profile.targetRaceDate,
      isUnwell: formData.get("isUnwell") === "on",
      recentTraining: await getRecentTraining(user.id),
    })

    await saveTrainingPlan(user.id, result.plan, {
      aiModel: result.aiModel,
      aiPromptVersion: result.aiPromptVersion,
      aiRawOutput: result.aiRawOutput,
    })

    await planGenerationLog.create({
      data: {
        userId: user.id,
        outcome: "SUCCESS",
        attempts: result.attempts,
        repairs: result.repairs,
        aiModel: result.aiModel,
        promptVersion: result.aiPromptVersion,
        durationMs: Date.now() - startedAt,
      },
    })
  } catch (error) {
    if (!(error instanceof PlanGenerationError)) {
      // Log the message only: never personal data
      console.error("Plan generation failed:", (error as Error).message)
      return { error: "Something went wrong while saving your plan. Please try again." }
    }

    // A race date that is too close is rejected before any AI call, so nothing is logged
    if (error.attempts > 0) {
      await planGenerationLog.create({
        data: {
          userId: user.id,
          outcome: error.temporary ? "UNAVAILABLE" : "RULES_FAILED",
          attempts: error.attempts,
          promptVersion: PROMPT_VERSION,
          durationMs: Date.now() - startedAt,
          problems: error.rejectedAttempts as Prisma.InputJsonValue | undefined,
        },
      })
    }
    return { error: error.userMessage }
  }

  revalidatePath("/training-plan")
  revalidatePath("/dashboard")
}