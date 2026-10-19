"use client"

import { useActionState } from "react"
import { registerUser } from "./actions"
import Link from "next/link"
import PasswordInput from "@/components/password-input"

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerUser, undefined)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-muted">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="John Doe"
          autoComplete="name"
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-muted"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-muted">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="john@gmail.com"
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-muted"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-muted">
          Password
        </label>
          <PasswordInput
          id="password"
          name="password"
          required
          placeholder="********"
          autoComplete="new-password"
        />
        <p className="mt-1 text-xs text-muted">Password must be at least 8 characters</p>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary py-2 font-semibold text-primary-foreground disabled:opacity-60 hover:bg-primary-hover"
      >
        {pending ? "Creating account..." : "Create account"}
        </button>
        <p className="text-center text-sm text-muted"> Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-link hover:underline"
          >
            Log in
          </Link>
        </p>
      
    </form>
  )
}