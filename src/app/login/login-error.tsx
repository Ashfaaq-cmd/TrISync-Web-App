"use client"

import { useSearchParams } from "next/navigation"

export default function LoginError() {
  // Auth.js redirects to /login?error=... when Google sign-in fails
  const searchParams = useSearchParams()
    const params = useSearchParams()

  if (params.get("deleted")) {
    return (
      <p role="status" className="mb-4 text-sm text-success">
        Your account and data have been deleted.
      </p>
    )
  }

  const error = params.get("error")
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