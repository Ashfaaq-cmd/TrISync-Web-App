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
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
        <input
          type="email"
          name="email"
            id="email"
            required
            placeholder="john@gmail.com"
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500"/>
        </div>
        <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <PasswordInput
          name="password"
          id="password"
          placeholder="********"
          required
          autoComplete="current-password"
        />
        </div>
        {state?.error && (
            <p role="alert" className="text-sm text-red-600">{state.error}</p>
        )}
        <button type="submit" disabled={pending} className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white disabled:opacity-60 hover:bg-blue-700 cursor-pointer">
            {pending ? "Logging in..." : "Log in"}
        </button>
        <p className="text-center text-sm text-gray-700">New to TriSync?{" "}
            <Link href="/register" className="font-medium text-blue-600 hover:underline">
                Create an account
            </Link>
        </p>
        </form>
  )

}