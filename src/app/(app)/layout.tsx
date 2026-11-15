import Link from "next/link"
import type { ReactNode } from "react"
import AppHeader from "@/components/app-header"
import NavLinks from "@/components/nav-links"
import SignOutButton from "@/components/sign-out-button"
import ThemedLogo from "@/components/themed-logo"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar for tablet and desktop. Small screens use the menu in the header. */}
      <aside className="hidden w-60 shrink-0 flex-col bg-sidebar p-4 text-sidebar-foreground md:flex">
        <Link href="/dashboard" className="mb-6 block px-2">
          <ThemedLogo className="h-auto w-36" priority />
        </Link>
        <NavLinks />
        <div className="mt-2">
          <SignOutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}