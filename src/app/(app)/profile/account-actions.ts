"use server"

import { signOut } from "@/auth"
import { deleteAvatarFile } from "@/lib/avatar-storage"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"

export type DeleteAccountState = { error?: string } | undefined

export async function deleteAccount(
  _previousState: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  // Only the signed-in user's own account can be deleted
  const user = await requireUser()

  // The typed email is checked here too: the browser check is only a convenience
  const typed = String(formData.get("confirmation") ?? "").trim().toLowerCase()
  const expected = (user.email ?? "").toLowerCase()
  if (!expected || typed !== expected) {
    return { error: "Type your email address exactly to confirm." }
  }

  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: { image: true },
  })

  try {
    // Everything linked to the user is deleted with them
    await prisma.user.delete({ where: { id: user.id } })
  } catch (error) {
    console.error("Deleting an account failed:", (error as Error).message)
    return { error: "Your account could not be deleted. Please try again." }
  }

  await deleteAvatarFile(account?.image)

  // Ends the session and returns to the login page
  await signOut({ redirectTo: "/login?deleted=1" })
}