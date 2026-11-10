"use client"

import { useActionState } from "react"
import type { StoredInsight } from "@/lib/validations/workout-insight"
import { requestInsight } from "./insight-actions"

type InsightSectionProps = { logId: string; insight: StoredInsight | null }

export default function InsightSection({ logId, insight }: InsightSectionProps) {
  const [state, formAction, pending] = useActionState(requestInsight, undefined)

  if (insight) {
    return (
      <div className="mt-3 rounded-lg border border-border bg-primary-soft p-3 text-sm">
        <p className="text-xs font-bold uppercase text-muted">AI feedback</p>
        <p className="mt-1 font-semibold text-foreground">{insight.headline}</p>
        <p className="mt-1 text-foreground">{insight.details}</p>
        <p className="mt-1 text-foreground">
          <span className="font-semibold">Next time:</span> {insight.suggestion}
        </p>
        <p className="mt-2 text-xs text-muted">
          General guidance, not medical advice.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="mt-3 space-y-1">
      <input type="hidden" name="logId" value={logId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
      >
        {pending ? "Getting feedback..." : "Get AI feedback"}
      </button>
      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
    </form>
  )
}