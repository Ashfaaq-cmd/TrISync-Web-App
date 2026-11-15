"use client"
import { Moon, Sun } from  "lucide-react"
import { THEME_STORAGE_KEY } from "@/lib/theme"

export default function ThemeToggle(){
    function toggle(){
        const root = document.documentElement
        // fade color for a moment then switch
        root.classList.add("theme-transition")
        const isDark = root.classList.toggle("dark")
        try{
            localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light")
        }
        catch{
                  // Private browsing can block storage: the theme still changes for this visit

        }
        window.setTimeout(()=> root.classList.remove("theme-transition"),250)
    }
      return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-lg p-2 text-foreground hover:bg-background"
    >
      {/* The icon shows the theme you are in. The page's theme class decides which is visible. */}
      <Sun className="size-5 dark:hidden" aria-hidden="true" />
      <Moon className="hidden size-5 dark:block" aria-hidden="true" />
      <span className="sr-only dark:hidden">Switch to dark mode</span>
      <span className="sr-only hidden dark:inline">Switch to light mode</span>
    </button>
  )
}