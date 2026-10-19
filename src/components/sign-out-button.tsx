import { signOut } from "@/auth"

export default function SignOutButton() {
    return (
        <form action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
        }}
        >
            <button
                type="submit"
                className="rounded-lg bg-primary py-2 px-4 font-semibold text-primary-foreground disabled:opacity-60 hover:bg-primary-hover"
            >
                Sign out
            </button>
        </form>
    )
}