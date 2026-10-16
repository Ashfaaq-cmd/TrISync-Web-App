"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Lottie } from "lottie-react"
import animationData from "@/animations/trisplash.json"

const SPLASH_DURATION = 4000 // Duration of the splash screen in milliseconds

export default function Splash({ name }: { name?: string | null }) {
    const router = useRouter()
    const firstName = name?.trim().split(/\s+/)[0]

    useEffect(() => {
        //go to dashboard once splash has finished
        const timer = setTimeout(()=> router.replace("/dashboard"), SPLASH_DURATION)
        return () => clearTimeout(timer) },[router])

    return (
        <main className="flex h-screen flex-col items-center justify-center bg-white p-4">
            <Lottie src={animationData} autoplay loop className="h-64 w-64" />
            <h1 className="mt-4 text-center text-2xl font-bold text-gray-900">{firstName ? `Welcome, ${firstName}`: "Welcome to TriSync"}
            </h1>
            <button type="button" onClick={() => router.replace("/dashboard")} className="mt-6 text-sm text-gray-500 underline hover:text-gray-700">
                Skip
            </button>
        </main>
    )
}
