"use client"

import { useSearchParams } from "next/navigation"

export default function LoginError() {
  // Auth.js redirects to /login?error=... when Google sign-in fails
  const error = useSearchParams().get("error")
  if (!error) return null

  const message =
    error === "OAuthAccountNotLinked"
      ? "This email is already registered with a password. Please log in with your email and password."
      : "Sign-in failed. Please try again."

  return (
    <p role="alert" className="mb-4 text-sm text-red-600">
      {error && message}
    </p>
  )
}