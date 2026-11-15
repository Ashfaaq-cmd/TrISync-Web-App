"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import NavLinks from "@/components/nav-links"
import SignOutButton from "@/components/sign-out-button"

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  // A stable function, so the links' route-change effect does not close the menu as it opens
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return

    // Stop the page behind the menu from scrolling
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeButton.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    // The menu is for small screens, so close it if the window becomes wide
    const wide = window.matchMedia("(min-width: 768px)")
    function onWidthChange(event: MediaQueryListEvent) {
      if (event.matches) setOpen(false)
    }

    document.addEventListener("keydown", onKeyDown)
    wide.addEventListener("change", onWidthChange)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
      wide.removeEventListener("change", onWidthChange)
      // Give focus back to the button that opened the menu
      menuButton.current?.focus()
    }
  }, [open])

  return (
    <>
      <button
        ref={menuButton}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="rounded-lg p-2 text-foreground hover:bg-background md:hidden"
      >
        <Menu className="size-6" aria-hidden="true" />
      </button>

      <div className="md:hidden">
        {/* Dark overlay: clicking it closes the menu */}
        <div
          onClick={close}
          aria-hidden="true"
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 motion-reduce:transition-none ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          // While closed, its links cannot be reached with the keyboard
          inert={!open}
          className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-sidebar p-4 shadow-xl transition-transform duration-200 ease-out motion-reduce:transition-none ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between px-2">
            <Image
              src="/trisync-logo-light.svg"
              alt="TriSync"
              width={200}
              height={100}
              className="h-auto w-28"
            />
            <button
              ref={closeButton}
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-active"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <NavLinks label="Mobile menu" onNavigate={close} />

          <div className="mt-auto">
            <SignOutButton />
          </div>
        </div>
      </div>
    </>
  )
}