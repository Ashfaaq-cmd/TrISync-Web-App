import { cache } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// Return the signed-in user / send user to the login page
export const requireUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true },
  })
  if (!user) redirect("/login")

  return user
})

// Same as requireUser, but also sends users without a profile to onboarding
export const requireOnboardedUser = cache(async () => {
  const user = await requireUser()

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
  if (!profile) redirect("/onboarding")

  return { user, profile }
})