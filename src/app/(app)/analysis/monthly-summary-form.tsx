"use client"

import { useActionState } from "react"
import { generateMonthlySummary } from "./actions"

type Props = { hasSummary: boolean; monthLabel: string }

export default function MonthlySummaryForm({ hasSummary, monthLabel }: Props) {
  const [state, formAction, pending] = useActionState(generateMonthlySummary, undefined)

  return (
    <form action={formAction} className="space-y-2">
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
      >
        {pending
          ? "Writing your summary..."
          : hasSummary
            ? "Update summary"
            : `Generate summary for ${monthLabel}`}
      </button>
      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
    </form>
  )
}