import LoginForm from "./login-form";
import ThemedLogo from "@/components/themed-logo";
import { Suspense } from "react"
import GoogleButton from "@/components/google-btn"
import LoginError from "./login-error"
import Link from "next/link"

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md rounded-xl bg-surface p-8 shadow">
                <ThemedLogo className="mx-auto mb-6 h-auto w-48" priority />
                <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
                <p className="mb-6 mt-1 text-sm text-muted">
                    Your next milestone starts here
                </p>
                 <Suspense fallback={null}>
                    <LoginError />
                </Suspense>
                <LoginForm />
                <p className="my-4 text-center text-sm text-muted">or</p>
                <GoogleButton />
                                <p className="mt-4 text-center text-xs text-muted">
                  By continuing you agree to the{" "}
                  <Link href="/privacy" className="text-link hover:underline">
                    privacy notice
                  </Link>
                  .
                </p>
            </div>
        </main>
    )
}