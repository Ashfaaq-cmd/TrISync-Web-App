"use client"

import { useActionState, useState } from "react"
import type { ChangeEvent } from "react"
import { DAYS, GOALS, LEVELS, MINUTES } from "@/lib/onboarding-options"
import { updateProfile } from "./actions"

type ProfileFormProps = {
  initial: {
    name: string
    experienceLevel: string
    goal: string
    daysPerWeek: string
    minutesPerSession: string
    targetRaceDate: string
  }
}

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
const labelClass = "block text-sm font-medium text-muted"

export default function ProfileForm({ initial }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined)
  const [values, setValues] = useState(initial)

  function handleChange(field: keyof typeof initial) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setValues((previous) => ({ ...previous, [field]: event.target.value }))
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          value={values.name}
          onChange={handleChange("name")}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="experienceLevel" className={labelClass}>
          Experience level
        </label>
        <select
          id="experienceLevel"
          name="experienceLevel"
          value={values.experienceLevel}
          onChange={handleChange("experienceLevel")}
          className={inputClass}
        >
          {LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="goal" className={labelClass}>
          Goal
        </label>
        <select
          id="goal"
          name="goal"
          value={values.goal}
          onChange={handleChange("goal")}
          className={inputClass}
        >
          {GOALS.map((goal) => (
            <option key={goal.value} value={goal.value}>
              {goal.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="daysPerWeek" className={labelClass}>
            Training days per week
          </label>
          <select
            id="daysPerWeek"
            name="daysPerWeek"
            value={values.daysPerWeek}
            onChange={handleChange("daysPerWeek")}
            className={inputClass}
          >
            {DAYS.map((day) => (
              <option key={day} value={String(day)}>
                {day}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="minutesPerSession" className={labelClass}>
            Minutes per session
          </label>
          <select
            id="minutesPerSession"
            name="minutesPerSession"
            value={values.minutesPerSession}
            onChange={handleChange("minutesPerSession")}
            className={inputClass}
          >
            {MINUTES.map((minute) => (
              <option key={minute} value={String(minute)}>
                {minute}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="targetRaceDate" className={labelClass}>
          Race date (optional)
        </label>
        <input
          id="targetRaceDate"
          name="targetRaceDate"
          type="date"
          value={values.targetRaceDate}
          onChange={handleChange("targetRaceDate")}
          className={inputClass}
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" className="text-sm text-success">
          Profile saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary py-2 font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  )
}