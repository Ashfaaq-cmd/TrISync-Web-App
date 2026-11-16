import RegisterForm from "./register-form"
import ThemedLogo from "@/components/themed-logo";
import GoogleButton from "@/components/google-btn"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl bg-surface p-8 shadow">
        <ThemedLogo className="mx-auto mb-6 h-auto w-48" priority />
        <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
        <p className="mb-6 mt-1 text-sm text-muted">
          Start your triathlon journey
        </p>
           <RegisterForm />
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