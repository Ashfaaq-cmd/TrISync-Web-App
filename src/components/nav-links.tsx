"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const links =[
    { href:"/dashboard", label: "Dashboard" },
    { href:"/training-plan", label: "Training Plan" },
    { href:"/log-workout", label: "Log Workout" },
    { href:"/analysis", label: "Analysis" },
    { href:"/learning-hub", label: "Learning Hub" },
    { href:"/profile", label: "Profile" },
]

type NavLinkProps = { orientation?: "vertical" | "horizontal" }
export default function NavLinks({ orientation = "vertical" }: NavLinkProps){
    const pathname = usePathname()
    return(
        <nav aria-label="Main" className={orientation === "vertical" ? "flex flex-col gap-1" : "flex gap-1 overflow-x-auto"}>

            {links.map(({ href,label })=>{
                //highlight section when viewing a page
                const active = pathname === href || pathname.startsWith(`${href}/`)
                return(
                    <Link
                    key={href}
                    href={href}
                    aria-current = {active ? "page": undefined}
                    className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm ${active ? "bg-sidebar-active font-semibold text-sidebar-active-foreground": "text-sidebar-active-foreground hover:bg-sidebar-active"}`}
                    >
                        {label}
                    </Link>
                )
            })}
        </nav>
    )
}