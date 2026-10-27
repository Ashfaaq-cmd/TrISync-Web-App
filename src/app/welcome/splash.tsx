"use client"

import { useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Lottie } from "lottie-react"
import { ArrowRight } from "lucide-react"
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
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 px-5 py-10 text-white">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl"
            />

            <section className="relative flex w-full max-w-lg flex-col items-center rounded-3xl border border-white/10 bg-white/6 px-6 py-9 text-center shadow-2xl shadow-black/30 backdrop-blur-sm sm:px-12 sm:py-12">
                <Image
                    src="/trisync-logo-white.png"
                    alt="TriSync"
                    width={240}
                    height={120}
                    priority
                    className="mb-5 h-16 w-32 object-contain"
                />

                <div className="relative mb-5 flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
                    <div
                        aria-hidden="true"
                        className="absolute inset-4 rounded-full border border-white/10 bg-linear-to-br from-blue-400/15 to-orange-400/10 shadow-[0_0_80px_rgba(59,130,246,0.15)]"
                    />
                    <Lottie
                        src={animationData}
                        autoplay
                        loop
                        className="relative h-full w-full"
                    />
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-200">
                    Your journey starts here
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    {firstName ? `Welcome, ${firstName}` : "Welcome to TriSync"}
                </h1>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300 sm:text-base">
                    Swim, bike, run. Your training journey is ready when you are.
                </p>

                <div className="mt-8 flex items-center gap-2" aria-label="Swim, bike, run">
                    <span className="h-2 w-2 rounded-full bg-sky-400" />
                    <span className="h-2 w-2 rounded-full bg-orange-400" />
                    <span className="h-2 w-2 rounded-full bg-amber-300" />
                </div>

                <button
                    type="button"
                    onClick={() => router.replace("/dashboard")}
                    className="mt-8 inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                    Skip to dashboard
                    <ArrowRight aria-hidden="true" size={18} />
                </button>
            </section>
        </main>
    )
}
