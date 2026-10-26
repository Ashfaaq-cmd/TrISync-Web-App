import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import NavLinks from "@/components/nav-links";
import SignOutButton from "@/components/sign-out-button";

export default function AppLayout({  children }:{ children: React.ReactNode}) {
return(
    <div className="flex min-h-screen flex-col md:flex-row">
        {/* Sidebar for tablet & desktop */}
        <aside className="hidden w-60 shrink-0 flex-col bg-sidebar p-4 md:flex">
            <Link href="/dashboard" className="mb-6 block px-2">
            <Image
            src="/trisync-logo-black.png"
            alt="Trisync"
            width={200}
            height={100}
            priority
            className="h-auto w-36"
            />
            </Link>
            <NavLinks />
            <div className="mt-3">
                <SignOutButton className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm font-semibold text-foreground hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
            </div>
        </aside>

        {/* Top bar for small screens */}
        <header className="bg-sidebar p-3 md:hidden">
            <div className="mb-2 flex items-center justify-between">
                 <Link href="/dashboard">
            <Image
            src="/trisync-logo-black.png"
            alt="Trisync"
            width={200}
            height={90}
            priority
            className="h-auto w-24"
            />
            </Link>
                <SignOutButton className="rounded-lg px-3 py-1 text-sm text-sidebar-foreground hover:bg-sidebar-active" />
            </div>
            <NavLinks orientation="horizontal"/>
        </header>
            
            <div className="min-w-0 flex-1">{children}</div>
            </div>
)
}