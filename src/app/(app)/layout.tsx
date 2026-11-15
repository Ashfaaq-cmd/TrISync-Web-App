import Image from "next/image";
import Link from "next/link";
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
                <SignOutButton />
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
                <SignOutButton />
            </div>
            <NavLinks orientation="horizontal"/>
        </header>
            
            <div className="min-w-0 flex-1">{children}</div>
            </div>
)
}