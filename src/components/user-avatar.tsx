import Image from "next/image"

type UserAvatarProps = {
  src?: string | null
  name?: string | null
  email?: string | null
  size?: number
}

// "Ashfaaq Dulloo" becomes "AD", a single name or an email becomes its first two letters
function initialsOf(name?: string | null, email?: string | null) {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  const single = words[0] ?? (email ?? "").trim()
  return single.slice(0, 2).toUpperCase()
}

export default function UserAvatar({ src, name, email, size = 36 }: UserAvatarProps) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-xs font-semibold text-foreground"
      style={{ width: size, height: size }}
    >
      {src ? (
        // Decorative: the link around it carries the accessible name
        <Image
          src={src}
          alt=""
          width={size}
          height={size}
          unoptimized
          referrerPolicy="no-referrer"
          className="size-full object-cover"
        />
      ) : (
        initialsOf(name, email) || "?"
      )}
    </span>
  )
}