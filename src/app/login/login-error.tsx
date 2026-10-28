"use client"

import { useSearchParams } from "next/navigation"

export default function LoginError() {
  // Auth.js redirects to /login?error=... when Google sign-in fails
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  if (!error) return null

  const message =
    error === "OAuthAccountNotLinked"
      ? "This email is already registered with a password. Please log in with your email and password."
      : error === "AccessDenied"
        ? "Use a Google account with an @gmail.com address."
      : "Sign-in failed. Please try again."

  return (
    <p role="alert" className="mb-4 text-sm text-danger">
      {error && message}
    </p>
  )
}