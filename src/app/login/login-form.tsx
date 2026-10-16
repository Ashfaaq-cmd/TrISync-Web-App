"use client"
import Link from "next/link"
import { useActionState } from "react"
import { loginUser } from "./actions"

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginUser, undefined)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input
          type="email"
          name="email"
            id="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"/>
        </div>
        <div>
        <label htmlFor="password" className="block text-sm font-medium">password</label>
        <input
          type="password"
          name="password"
            id="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"/>
        </div>
        {state?.error && (
            <p role="alert" className="text-sm text-red-600">{state.error}</p>
        )}
        <button type="submit" disabled={pending} className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white disabled:opacity-60">
            {pending ? "Logging in..." : "Log in"}
        </button>
        <p className="text-center text-sm text-gray-600">New to TriSync?{" "}
            <Link href="/register" className="font-medium text-blue-600 hover:underline">
                Create an account
            </Link>
        </p>
        </form>
  )

}