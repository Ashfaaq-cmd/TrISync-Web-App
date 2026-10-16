import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "./prisma"
//return the signed-in user or redirect to login page if not signed in
export async function requireUser(){
    const session = await auth()
    if(!session?.user?.id) redirect("/login")
        return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
}
}
// Same as requireUser, but also sends users without a profile to onboarding
export async function requireOnboardedUser() {
  const user = await requireUser()

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
  if (!profile) redirect("/onboarding")

  return { user, profile }
}