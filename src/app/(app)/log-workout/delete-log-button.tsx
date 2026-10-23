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
        className="rounded-lg border border-danger bg-surface px-3 py-1.5 text-sm font-semibold text-danger hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
        className="rounded-lg border border-danger bg-surface px-3 py-1.5 font-semibold text-danger hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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