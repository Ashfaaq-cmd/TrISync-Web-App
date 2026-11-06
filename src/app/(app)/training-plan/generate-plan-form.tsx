"use client"
import { useActionState } from "react"
import { generatePlan } from "./actions"

export default function GeneratePlanForm({ hasPlan }: { hasPlan: boolean }){
    const [state, formAction, pending] = useActionState(generatePlan,undefined)
    return (
  <form action={formAction} className="space-y-3">
      <label className="flex items-start gap-2 text-sm text-foreground">
        <input type="checkbox" name="isUnwell" className="mt-1" />
        <span>
          I am currently ill, injured or very tired, so start gently.
        </span>
      </label>

      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-5 py-2 font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Building your plan..." : hasPlan ? "Generate a new plan" : "Generate my plan"}
      </button>

      {pending && (
        <p role="status" className="text-sm text-muted">
          This can take up to a minute. Please keep this page open.
        </p>
      )}

      <p className="text-xs text-muted">
        Only your level, goal, availability, race date and a summary of your recent
        training minutes are sent to the AI service. Your name and email are not.
      </p>
    </form>
  )
}