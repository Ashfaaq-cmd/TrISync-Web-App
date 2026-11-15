import { LogOut } from "lucide-react"
import { signOutUser } from "@/lib/auth-actions"

export default function SignOutButton() {
  return (
    <form action={signOutUser}>
      <button
        type="submit"
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-left text-sm font-semibold text-danger transition-colors hover:bg-danger/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
      >
        <span>Sign out</span>
        <LogOut className="size-4 shrink-0" aria-hidden="true" />
      </button>
    </form>
  )
}