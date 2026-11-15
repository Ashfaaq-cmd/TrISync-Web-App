import Image from "next/image"

type ThemedLogoProps = { className?: string; priority?: boolean }

// Use the logo variant whose background matches the current theme.
export default function ThemedLogo({ className = "", priority }: ThemedLogoProps) {
  return (
    <>
      <Image
        src="/trisync-logo-white.png"
        alt="TriSync"
        width={200}
        height={100}
        priority={priority}
        className={`${className} dark:hidden`}
      />
      <Image
        src="/trisync-logo-black.png"
        alt=""
        aria-hidden="true"
        width={200}
        height={100}
        priority={priority}
        className={`${className} hidden dark:block`}
      />
    </>
  )
}