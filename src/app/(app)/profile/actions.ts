"use server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireOnboardedUser } from "@/lib/session"
import { onboardingSchema } from "@/lib/validations/onboarding"

const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(60, "Name must be at most 60 characters")

export type ProfileState = { error?: string; success?: boolean } | undefined

export async function updateProfile(
  _previousState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  // Only the signed-in user's own profile can be changed
  const { user } = await requireOnboardedUser()

  const name = nameSchema.safeParse(formData.get("name"))
  if (!name.success) return { error: name.error.issues[0].message }

  const parsed = onboardingSchema.safeParse({
    experienceLevel: formData.get("experienceLevel"),
    raceGoal: formData.get("goal"),
    daysPerWeek: formData.get("daysPerWeek"),
    minutesPerSession: formData.get("minutesPerSession"),
    targetRaceDate: formData.get("targetRaceDate") || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  // The form calls it raceGoal, the database column is goal
  const { raceGoal, targetRaceDate, ...profileData } = parsed.data

  // Both updates succeed together or not at all
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { name: name.data } }),
    prisma.profile.update({
      where: { userId: user.id },
      data: {
        ...profileData,
        goal: raceGoal,
        // An empty date field clears the saved race date
        targetRaceDate: targetRaceDate ?? null,
      },
    }),
  ])

  revalidatePath("/profile")
  return { success: true }
}