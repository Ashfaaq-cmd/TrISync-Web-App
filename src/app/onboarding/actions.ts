"use server"

import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { onboardingSchema } from "@/lib/validations/onboarding"
import { ExperienceLevel } from "@/generated/prisma"

export type OnboardingState = { error?: string } | undefined

export async function saveOnboarding(
    _previousState: OnboardingState,
    formData: FormData
): Promise<OnboardingState> {
    //only signed in user can save a profile and only their own
const session = await auth()
if(!session?.user?.id) redirect("/login")
    const userId = session.user.id

const parsed = onboardingSchema.safeParse({
    experienceLevel: formData.get("experienceLevel"),
    goal: formData.get("goal"),
    daysPerWeek: formData.get("daysPerWeek"),
    minutesPerSession: formData.get("minutesPerSession"),
    //empty date field arrives as "" treat as not provided
    targetRaceDate: formData.get("targetRaceDate") || undefined,
    
})
if(!parsed.success){
    return{ error: parsed.error.issues[0].message}
}
await prisma.profile.upsert({
    where: { userId },
    create: { userId, ...parsed.data },
    update: parsed.data,
  })
redirect("/welcome")
}
