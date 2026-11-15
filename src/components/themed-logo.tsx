import Image from "next/image"

type ThemedLogoProps = { className?: string; priority?: boolean }

// Black-text logo on light backgrounds, white-text logo on dark ones
export default function ThemedLogo({ className = "", priority }: ThemedLogoProps) {
  return (
    <>
      <Image
        src="/trisync-logo-dark.svg"
        alt="TriSync"
        width={200}
        height={100}
        priority={priority}
        className={`${className} dark:hidden`}
      />
      <Image
        src="/trisync-logo-light.svg"
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