import { cache } from "react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// The signed-in user's name and photo for the header. Null if nobody is signed in.
export const getHeaderUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true },
  })
})