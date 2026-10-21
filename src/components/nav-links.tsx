"use client"

import { Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/training-plan", label: "Training Plan" },
  { href: "/log-workout", label: "Log Workout" },
  { href: "/analysis", label: "Analysis" },
  { href: "/learning-hub", label: "Learning Hub" },
  { href: "/profile", label: "Profile" },
]

type NavLinksProps = { orientation?: "vertical" | "horizontal" }

type NavListProps = NavLinksProps & { pathname: string | null }

function NavList({ orientation = "vertical", pathname }: NavListProps) {
  return (
    <nav
      aria-label="Main"
      className={
        orientation === "vertical"
          ? "flex flex-col gap-1"
          : "flex gap-1 overflow-x-auto"
      }
    >
      {links.map(({ href, label }) => {
        // Also highlight the section when viewing a page inside it
        const active =
          pathname !== null &&
          (pathname === href || pathname.startsWith(`${href}/`))

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm ${
              active
                ? "bg-sidebar-active font-semibold text-sidebar-active-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-active"
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

// Reading the current path has to wait for the request, so it sits inside Suspense
function NavWithPath(props: NavLinksProps) {
  const pathname = usePathname()
  return <NavList {...props} pathname={pathname} />
}

export default function NavLinks(props: NavLinksProps) {
  return (
    <Suspense fallback={<NavList {...props} pathname={null} />}>
      <NavWithPath {...props} />
    </Suspense>
  )
}