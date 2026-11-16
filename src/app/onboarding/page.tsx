import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import OnboardingForm from "./onboarding-form"; 
import { getHeaderUser } from "@/lib/header-user"

export default function OnboardingPage(){
    return(
        <main className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-xl rounded-xl bg-surface p-8 shadow">
                <Suspense fallback={<p className="text-muted">Loading...</p>}>
                <OnboardingContent />
                </Suspense>
            </div>
        </main>
    )
}

async function OnboardingContent() {
    await connection()
    const user = await requireUser()
    const account = await getHeaderUser()

    // Users who already finished onboarding dont see it again
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
    if(profile) redirect ("/dashboard")
    return <OnboardingForm image={account?.image ?? null} name={account?.name} email={account?.email} />
}