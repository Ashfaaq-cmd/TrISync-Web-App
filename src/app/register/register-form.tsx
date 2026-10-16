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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="John Doe"
          autoComplete="name"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="john@gmail.com"
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
          <PasswordInput
          id="password"
          name="password"
          required
          placeholder="********"
          autoComplete="new-password"
        />
        <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters</p>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white disabled:opacity-60 hover:bg-blue-700 cursor-pointer"
      >
        {pending ? "Creating account..." : "Create account"}
        </button>
        <p className="text-center text-sm text-gray-600"> Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Log in
          </Link>
        </p>
      
    </form>
  )
}