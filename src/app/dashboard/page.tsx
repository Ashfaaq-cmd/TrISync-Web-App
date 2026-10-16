import { Suspense } from "react"
import SignOutButton from "@/components/sign-out-button"
import { requireOnboardedUser } from "@/lib/session"
export default async function DashboardPage() {
    return (
        <Suspense fallback={<p className="p-8 text-gray-500">Loading...</p>}>
            <DashboardContent />
        </Suspense>
    )
}

async function DashboardContent() {
    const { user } = await requireOnboardedUser()
    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}!</h1>
            <p className="mb-6 text-gray-700">This is your dashboard. You can manage your account and settings here.</p>
            <div className="mt-6 max-w-xs">
            <SignOutButton />
            </div>
            </main>
    )
}