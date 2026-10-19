import RegisterForm from "./register-form"
import Image from "next/image"
import GoogleButton from "@/components/google-btn"

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl bg-surface p-8 shadow">
        <Image
          src="/trisync-logo-white.png"
          alt="TriSync Logo"
          width={100}
          height={100}
           priority
          className="mx-auto mb-5 h-auto w-40"
        />
        <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
        <p className="mb-6 mt-1 text-sm text-muted">
          Start your triathlon journey
        </p>
           <RegisterForm />
            <p className="my-4 text-center text-sm text-muted">or</p>
            <GoogleButton />
      </div>
    </main>
  )
}