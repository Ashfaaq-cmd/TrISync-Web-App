"use client"
import { useActionState, useState } from "react"
import type { ChangeEvent } from "react"
import { formatEnum } from "@/lib/discipline"
import { logWorkout } from "./actions"

type WorkoutOption = { id: string; label: string; discipline: string }

type LogWorkoutFormProps = {
  workouts: WorkoutOption[]
  initialWorkoutId: string
  defaultDate: string
}

const DISCIPLINES = [
  { value: "SWIM", label: "Swim" },
  { value: "BIKE", label: "Bike" },
  { value: "RUN", label: "Run" },
  { value: "BRICK", label: "Brick" },
  { value: "STRENGTH", label: "Strength" },
]

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground placeholder:text-muted"
const labelClass = "block text-sm font-medium text-muted"

export default function LogWorkoutForm({
  workouts,
  initialWorkoutId,
  defaultDate,
}: LogWorkoutFormProps) {
  const [state, formAction, pending] = useActionState(logWorkout, undefined)
  const [workoutId, setWorkoutId] = useState(initialWorkoutId)
  const [values, setValues] = useState({
    discipline: "",
    date: defaultDate,
    distanceKm: "",
    durationMin: "",
    avgHeartRate: "",
    notes: "",
  })

  const selected = workouts.find((workout) => workout.id === workoutId)

  // Fields are controlled, so a failed submit does not wipe what the user typed
  function handleChange(field: keyof typeof values) {
    return (
      event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => setValues((previous) => ({ ...previous, [field]: event.target.value }))
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="workoutId" className={labelClass}>
          Planned workout
        </label>
        <select
          id="workoutId"
          name="workoutId"
          value={workoutId}
          onChange={(event) => setWorkoutId(event.target.value)}
          className={inputClass}
        >
          <option value="">Not part of my plan</option>
          {workouts.map((workout) => (
            <option key={workout.id} value={workout.id}>
              {workout.label}
            </option>
          ))}
        </select>
      </div>

      {selected ? (
        <p className="text-sm text-muted">
          Discipline: {formatEnum(selected.discipline)} (from your plan)
        </p>
      ) : (
        <div>
          <label htmlFor="discipline" className={labelClass}>
            Discipline
          </label>
          <select
            id="discipline"
            name="discipline"
            required
            value={values.discipline}
            onChange={handleChange("discipline")}
            className={inputClass}
          >
            <option value="">Choose a discipline</option>
            {DISCIPLINES.map((discipline) => (
              <option key={discipline.value} value={discipline.value}>
                {discipline.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="date" className={labelClass}>
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          value={values.date}
          onChange={handleChange("date")}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="durationMin" className={labelClass}>
            Duration (minutes)
          </label>
          <input
            id="durationMin"
            name="durationMin"
            type="number"
            required
            min="1"
            step="1"
            inputMode="numeric"
            placeholder="e.g. 45"
            value={values.durationMin}
            onChange={handleChange("durationMin")}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="distanceKm" className={labelClass}>
            Distance (km, optional)
          </label>
          <input
            id="distanceKm"
            name="distanceKm"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="e.g. 32.5"
            value={values.distanceKm}
            onChange={handleChange("distanceKm")}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-muted">For a 1,500 m swim, enter 1.5</p>
        </div>
      </div>

      <div>
        <label htmlFor="avgHeartRate" className={labelClass}>
          Average heart rate (bpm, optional)
        </label>
        <input
          id="avgHeartRate"
          name="avgHeartRate"
          type="number"
          min="30"
          max="250"
          step="1"
          inputMode="numeric"
          placeholder="e.g. 142"
          value={values.avgHeartRate}
          onChange={handleChange("avgHeartRate")}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={2000}
          placeholder="How did it feel?"
          value={values.notes}
          onChange={handleChange("notes")}
          className={inputClass}
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary py-2 font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save workout"}
      </button>
    </form>
  )
}