"use client"
import Link from "next/link"
import { useActionState } from "react"
import { loginUser } from "./actions"
import PasswordInput from "@/components/password-input"

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginUser, undefined)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-muted">Email Address</label>
        <input
          type="email"
          name="email"
            id="email"
            required
            pattern=".+@[gG][mM][aA][iI][lL][.]com"
            title="Use an email address ending in @gmail.com"
            placeholder="john@gmail.com"
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-muted"/>
        </div>
        <div>
        <label htmlFor="password" className="block text-sm font-medium text-muted">Password</label>
        <PasswordInput
          name="password"
          id="password"
          placeholder="********"
          required
          autoComplete="current-password"
        />
        </div>
        {state?.error && (
            <p role="alert" className="text-sm text-danger">{state.error}</p>
        )}
        <button type="submit" disabled={pending} className="w-full rounded-lg bg-primary py-2 font-semibold text-primary-foreground disabled:opacity-60 hover:bg-primary-hover">
            {pending ? "Logging in..." : "Log in"}
        </button>
        <p className="text-center text-sm text-muted">New to TriSync?{" "}
            <Link href="/register" className="font-medium text-link hover:underline">
                Create an account
            </Link>
        </p>
        </form>
  )

}