"use client"

import { useActionState, useState } from "react"
import { deleteAccount } from "./account-actions"

const dangerButton =
  "rounded-lg border border-red-600 bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-700 hover:bg-red-700 hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none motion-reduce:transition-none"

export default function DeleteAccountForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(deleteAccount, undefined)
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState("")

  const matches = typed.trim().toLowerCase() === email.toLowerCase()

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={dangerButton}>
        Delete Account
      </button>
    )
  }

  return (
    <form action={formAction} className="space-y-3">
      <p className="text-sm text-foreground">
        This permanently deletes your account, profile picture, training plans, logged
        sessions, AI feedback and summaries. It cannot be undone.
      </p>

      <div>
        <label htmlFor="confirmation" className="block text-sm font-medium text-muted">
          Type <span className="font-semibold text-foreground">{email}</span> to confirm
        </label>
        <input
          id="confirmation"
          name="confirmation"
          type="email"
          autoComplete="off"
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={!matches || pending} className={dangerButton}>
          {pending ? "Deleting..." : "Delete everything"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setTyped("")
          }}
          disabled={pending}
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-sidebar hover:shadow-sm active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none motion-reduce:transition-none"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}