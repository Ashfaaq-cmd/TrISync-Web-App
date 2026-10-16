"use client"

import { useState } from "react"
import type { ComponentProps } from "react"
import { Eye, EyeOff } from "lucide-react"

type PasswordInputProps = Omit<ComponentProps<"input">, "type">

export default function PasswordInput(props: PasswordInputProps) {
  // Whether the password is currently shown as plain text
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative mt-1">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder:text-gray-400"
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}