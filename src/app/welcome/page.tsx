import { Suspense } from "react"
import { requireUser } from "@/lib/session"
import Splash from "./splash"

export default async function WelcomePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <WelcomeContent />
        </Suspense>
    )
}
async function WelcomeContent() {
    const user = await requireUser()
    return <Splash name={user.name} />
}