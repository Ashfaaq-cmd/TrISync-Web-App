import { Suspense } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import OnboardingForm from "./onboarding-form"; 

export default function OnboardingPage(){
    return(
        <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-xl rounded-xl bg-white p-8 shadow">
                <Suspense fallback={<p className="text-gray-500">Loading...</p>}>
                <OnboardingContent />
                </Suspense>
            </div>
        </main>
    )
}

async function OnboardingContent() {
    const user = await requireUser()

    // Users who already finished onboarding dont see it again
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
    if(profile) redirect ("/dashboard")
        return <OnboardingForm/> 
}