"use client"

import { Suspense, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAV_ITEMS } from "@/components/nav-items"

type NavLinksProps = { label?: string; onNavigate?: () => void }
type NavListProps = NavLinksProps & { pathname: string | null }

function NavList({ label = "Main", pathname, onNavigate }: NavListProps) {
  return (
    <nav aria-label={label} className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label: itemLabel, icon: Icon }) => {
        // Also highlight the section when viewing a page inside it
        const active =
          pathname !== null &&
          (pathname === href || pathname.startsWith(`${href}/`))

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm ${
              active
                ? "bg-sidebar-active font-semibold text-sidebar-active-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-active"
            }`}
          >
            <span>{itemLabel}</span>
            <Icon className="size-4 shrink-0" aria-hidden="true" />
          </Link>
        )
      })}
    </nav>
  )
}

// Reading the current path has to wait for the request, so it sits inside Suspense
function NavWithPath(props: NavLinksProps) {
  const pathname = usePathname()
  const { onNavigate } = props

  // Also closes the mobile menu when the page changes another way, such as the Back button
  useEffect(() => {
    onNavigate?.()
  }, [pathname, onNavigate])

  return <NavList {...props} pathname={pathname} />
}

export default function NavLinks(props: NavLinksProps) {
  return (
    <Suspense fallback={<NavList {...props} pathname={null} />}>
      <NavWithPath {...props} />
    </Suspense>
  )
}