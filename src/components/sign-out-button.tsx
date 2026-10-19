import { signOut } from "@/auth"

type SignOutButtonProps = { className?: string }

export default function SignOutButton({ className }: SignOutButtonProps) {
  return (
    <form
      action={async () => {
        "use server"
        await signOut({ redirectTo: "/login" })
      }}
    >
      <button
        type="submit"
        className={
          className ??
          "w-full rounded-lg border border-border bg-surface py-2 font-semibold text-foreground hover:bg-background"
        }
      >
        Sign out
      </button>
    </form>
  )
}