"use server"

import { revalidatePath } from "next/cache"
import { del, put } from "@vercel/blob"
import { looksLikeJpeg, MAX_UPLOAD_BYTES } from "@/lib/avatar"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"

export type AvatarResult = { error?: string; url?: string | null }

// Only files we stored ourselves are ever deleted: never a Google photo or another site's URL
function isOurAvatar(url: string | null | undefined) {
  if (!url) return false
  try {
    const { hostname, pathname } = new URL(url)
    return hostname.endsWith(".public.blob.vercel-storage.com") && pathname.startsWith("/avatars/")
  } catch {
    return false
  }
}

// A failed clean-up is logged, never shown to the user
async function deleteAvatarFile(url: string | null | undefined) {
  if (!isOurAvatar(url)) return
  try {
    await del(url as string)
  } catch (error) {
    console.error("Could not delete an avatar file:", (error as Error).message)
  }
}

export async function uploadAvatar(formData: FormData): Promise<AvatarResult> {
  // The user always comes from the session, never from the form
  const user = await requireUser()

  const file = formData.get("avatar")
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a picture first." }
  if (file.size > MAX_UPLOAD_BYTES) return { error: "That picture is too large." }

  // Check the file's real contents, not just its name or declared type
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (!looksLikeJpeg(bytes)) return { error: "That file is not a valid picture." }

  const previous = await prisma.user.findUnique({
    where: { id: user.id },
    select: { image: true },
  })

  let url: string
  try {
    const blob = await put(`avatars/${user.id}/avatar.jpg`, Buffer.from(bytes), {
      access: "public",
      addRandomSuffix: true,
      contentType: "image/jpeg",
    })
    url = blob.url
  } catch (error) {
    console.error("Avatar upload failed:", (error as Error).message)
    return { error: "The picture could not be uploaded. Please try again later." }
  }

  try {
    await prisma.user.update({ where: { id: user.id }, data: { image: url } })
  } catch (error) {
    console.error("Saving the avatar failed:", (error as Error).message)
    await deleteAvatarFile(url)
    return { error: "The picture could not be saved. Please try again." }
  }

  // The old file is only removed once the new one is safely saved
  await deleteAvatarFile(previous?.image)

  // Refreshes every page, including the header avatar
  revalidatePath("/", "layout")
  return { url }
}

export async function removeAvatar(): Promise<AvatarResult> {
  const user = await requireUser()

  const previous = await prisma.user.findUnique({
    where: { id: user.id },
    select: { image: true },
  })

  try {
    await prisma.user.update({ where: { id: user.id }, data: { image: null } })
  } catch (error) {
    console.error("Removing the avatar failed:", (error as Error).message)
    return { error: "The picture could not be removed. Please try again." }
  }

  await deleteAvatarFile(previous?.image)

  revalidatePath("/", "layout")
  return { url: null }
}