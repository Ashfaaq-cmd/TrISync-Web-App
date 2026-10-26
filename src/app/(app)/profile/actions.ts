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
.max(60,"Name must be at most 60 characters")

export type ProfileState = { error?: string; success?: boolean } | undefined
export async function updateProfile(_previousState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
    //only signed in user can change his profile
    const { user } = await requireOnboardedUser()
    const name = nameSchema.safeParse(formData.get("name"))
    if(!name.success) return { error: name.error.issues[0].message }

    const parsed = onboardingSchema.safeParse({
        experienceLevel: formData.get("experienceLevel"),
    goal: formData.get("goal"),
    daysPerWeek: formData.get("daysPerWeek"),
    minutesPerSession: formData.get("minutesPerSession"),
    targetRaceDate: formData.get("targetRaceDate") || undefined,
    })
     if (!parsed.success) return { error: parsed.error.issues[0].message }

     // Both updates succeed together or not at all
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { name: name.data } }),
    prisma.profile.update({
      where: { userId: user.id },
      // An empty date field clears the saved race date
      data: { ...parsed.data, targetRaceDate: parsed.data.targetRaceDate ?? null },
    }),
  ])
  revalidatePath("/profile")
  return { success: true }
}