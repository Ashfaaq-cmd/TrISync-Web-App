import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import AppHeader from "@/components/app-header"
import NavLinks from "@/components/nav-links"
import SignOutButton from "@/components/sign-out-button"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar for tablet and desktop. Small screens use the menu in the header. */}
      <aside className="hidden w-60 shrink-0 flex-col bg-sidebar p-4 md:flex">
        <Link href="/dashboard" className="mb-6 block px-2">
          <Image
            src="/trisync-logo-light.svg"
            alt="TriSync"
            width={200}
            height={100}
            priority
            className="h-auto w-36"
          />
        </Link>
        <NavLinks />
        <div className="mt-auto">
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