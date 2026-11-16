import { Suspense } from "react"
import Link from "next/link"
import { connection } from "next/server"
import MobileNav from "@/components/mobile-nav"
import ThemedLogo from "@/components/themed-logo"
import ThemeToggle from "@/components/theme-toggle"
import UserAvatar from "@/components/user-avatar"
import { getHeaderUser } from "@/lib/header-user"
async function HeaderAvatar() {
  // This needs the signed-in user, so it is built for each request, never at build time
  await connection()
  const user = await getHeaderUser()

  return (
    <Link href="/profile" aria-label="Your profile" className="rounded-full">
      <UserAvatar src={user?.image} name={user?.name} email={user?.email} />
    </Link>
  )
}

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background px-4 text-foreground md:justify-end md:px-10">
      {/* Small screens only: the menu button and the logo */}
      <div className="flex items-center gap-2 md:hidden">
        <MobileNav />
        <Link href="/dashboard" aria-label="TriSync home">
          <ThemedLogo className="h-auto w-24" priority />
        </Link>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Suspense fallback={<UserAvatar size={36} />}>
          <HeaderAvatar />
        </Suspense>
      </div>
    </header>
  )
}