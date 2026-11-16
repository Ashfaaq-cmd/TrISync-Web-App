import { AVATAR_SIZE_PX } from "@/lib/avatar"

// Crops to a centred square, shrinks it and saves it as a JPEG. Doing this in the browser
// keeps uploads small and removes hidden photo data such as GPS location.
export async function resizeToAvatar(file: File): Promise<File> {
  // "from-image" turns photos the right way up using their camera orientation
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })

  try {
    const side = Math.min(bitmap.width, bitmap.height)
    const sourceX = (bitmap.width - side) / 2
    const sourceY = (bitmap.height - side) / 2

    const canvas = document.createElement("canvas")
    canvas.width = AVATAR_SIZE_PX
    canvas.height = AVATAR_SIZE_PX
    const context = canvas.getContext("2d")
    if (!context) throw new Error("Canvas is not available")

    // JPEG has no transparency, so transparent images get a white background
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, AVATAR_SIZE_PX, AVATAR_SIZE_PX)
    context.drawImage(bitmap, sourceX, sourceY, side, side, 0, 0, AVATAR_SIZE_PX, AVATAR_SIZE_PX)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    )
    if (!blob) throw new Error("Could not create the image")

    return new File([blob], "avatar.jpg", { type: "image/jpeg" })
  } finally {
    bitmap.close()
  }
}