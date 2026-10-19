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
                className="rounded-lg bg-blue-600 py-2 px-4 font-semibold text-white disabled:opacity-60 hover:bg-blue-700"
            >
                Sign out
            </button>
        </form>
    )
}