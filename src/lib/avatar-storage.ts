import { del } from "@vercel/blob"

// Only files we stored ourselves are ever deleted: never a Google photo or another site's URL
export function isOurAvatar(url: string | null | undefined) {
  if (!url) return false
  try {
    const { hostname, pathname } = new URL(url)
    return hostname.endsWith(".public.blob.vercel-storage.com") && pathname.startsWith("/avatars/")
  } catch {
    return false
  }
}

// A failed clean-up is logged, never shown to the user
export async function deleteAvatarFile(url: string | null | undefined) {
  if (!url || !isOurAvatar(url)) return
  try {
    await del(url)
  } catch (error) {
    console.error("Could not delete an avatar file:", (error as Error).message)
  }
}