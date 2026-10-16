import { Suspense } from "react"
import Splash from "./splash"
import { requireOnboardedUser } from "@/lib/session"

export default async function WelcomePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <WelcomeContent />
        </Suspense>
    )
}
async function WelcomeContent() {
    const { user } = await requireOnboardedUser()
    return <Splash name={user.name} />
}