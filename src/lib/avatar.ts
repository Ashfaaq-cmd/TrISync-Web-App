export const AVATAR_SIZE_PX = 512
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]
export const MAX_ORIGINAL_BYTES = 10 * 1024 * 1024
// After resizing a picture is about 100 KB. Next.js server actions accept 1 MB by default.
export const MAX_UPLOAD_BYTES = 500 * 1024

// A real JPEG starts with these three bytes, whatever the file is called
export function looksLikeJpeg(bytes: Uint8Array) {
  return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
}