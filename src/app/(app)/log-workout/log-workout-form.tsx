"use client"
import { useActionState, useState } from "react"
import type { ChangeEvent } from "react"
import Link from "next/link"
import { formatEnum } from "@/lib/discipline"
import { logWorkout, updateWorkoutLog } from "./actions"

type WorkoutOption = { id: string; label: string; discipline: string }

type FormValues = {
  discipline: string
  date: string
  distance: string
  durationMin: string
  avgHeartRate: string
  notes: string
}

type EditDetails = {
  logId: string
  workoutTitle: string | null
  distanceUnit: "km" | "m"
  values: FormValues
}

type LogWorkoutFormProps = {
  workouts?: WorkoutOption[]
  initialWorkoutId?: string
  defaultDate?: string
  edit?: EditDetails
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
  workouts = [],
  initialWorkoutId = "",
  defaultDate = "",
  edit,
}: LogWorkoutFormProps) {
  const [state, formAction, pending] = useActionState(
    edit ? updateWorkoutLog : logWorkout,
    undefined
  )
  const [workoutId, setWorkoutId] = useState(initialWorkoutId)
  const [values, setValues] = useState<FormValues>(
    edit?.values ?? {
      discipline: "",
      date: defaultDate,
      distance: "",
      durationMin: "",
      avgHeartRate: "",
      notes: "",
    }
  )
  // null means "the user has not chosen a unit yet"
  const [unitChoice, setUnitChoice] = useState<"km" | "m" | null>(
    edit?.distanceUnit ?? null
  )

  const selected = workouts.find((workout) => workout.id === workoutId)
  const isPlanned = edit ? edit.workoutTitle !== null : Boolean(selected)

  // Swims default to metres, everything else to kilometres
  const currentDiscipline = selected?.discipline ?? values.discipline
  const unit = unitChoice ?? (currentDiscipline === "SWIM" ? "m" : "km")

  // Fields are controlled, so a failed submit does not wipe what the user typed
  function handleChange(field: keyof FormValues) {
    return (
      event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => setValues((previous) => ({ ...previous, [field]: event.target.value }))
  }

  return (
    <form action={formAction} className="space-y-4">
      {edit && <input type="hidden" name="logId" value={edit.logId} />}

      {edit ? (
        <p className="text-sm text-muted">
          {edit.workoutTitle ?? "Unplanned session"}
        </p>
      ) : (
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
      )}

      {isPlanned ? (
        <p className="text-sm text-muted">
          Discipline: {formatEnum(selected?.discipline ?? values.discipline)} (from your plan)
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
          <label htmlFor="distance" className={labelClass}>
            Distance (optional)
          </label>
          <div className="flex gap-2">
            <input
              id="distance"
              name="distance"
              type="number"
              min="0"
              step={unit === "m" ? "1" : "0.01"}
              inputMode="decimal"
              placeholder={unit === "m" ? "e.g. 1500" : "e.g. 32.5"}
              value={values.distance}
              onChange={handleChange("distance")}
              className={inputClass}
            />
            <select
              name="distanceUnit"
              aria-label="Distance unit"
              value={unit}
              onChange={(event) => setUnitChoice(event.target.value as "km" | "m")}
              className="mt-1 rounded-lg border border-border bg-surface px-2 py-2 text-foreground"
            >
              <option value="km">km</option>
              <option value="m">m</option>
            </select>
          </div>
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

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg bg-primary py-2 font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
        >
          {pending ? "Saving..." : edit ? "Save changes" : "Save workout"}
        </button>
        {edit && (
          <Link
            href="/log-workout"
            className="rounded-lg border border-border bg-surface px-4 py-2 text-center font-semibold text-foreground hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Cancel
          </Link>
        )}
      </div>
    </form>
  )
}