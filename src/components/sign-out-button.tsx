import { LogOut } from "lucide-react"
import { signOutUser } from "@/lib/auth-actions"

export default function SignOutButton() {
  return (
    <form action={signOutUser}>
      <button
        type="submit"
        className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm text-sidebar-foreground hover:bg-sidebar-active"
      >
        <span>Sign out</span>
        <LogOut className="size-4 shrink-0" aria-hidden="true" />
      </button>
    </form>
  )
}