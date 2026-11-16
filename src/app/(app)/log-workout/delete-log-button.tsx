"use client"

import { useState } from "react"
import { deleteWorkoutLog } from "./actions"

export default function DeleteLogButton({ logId }: { logId: string }) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-red-600 bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-700 hover:bg-red-700 hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 motion-reduce:transform-none motion-reduce:transition-none"
      >
        Delete
      </button>
    )
  }

  return (
    <form action={deleteWorkoutLog} className="flex items-center gap-3 text-sm">
      <input type="hidden" name="logId" value={logId} />
      <span className="text-muted">Delete this session?</span>
      <button
        type="submit"
        className="rounded-lg border border-red-600 bg-red-600 px-3 py-1.5 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-700 hover:bg-red-700 hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 motion-reduce:transform-none motion-reduce:transition-none"
      >
        Yes, delete
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-lg border border-border bg-surface px-3 py-1.5 font-semibold text-foreground hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Cancel
      </button>
    </form>
  )
}