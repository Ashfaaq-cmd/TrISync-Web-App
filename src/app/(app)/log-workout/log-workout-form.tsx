"use client"

import { useActionState, useState } from "react"
import type { ChangeEvent } from "react"
import Link from "next/link"
import { formatEnum } from "@/lib/discipline"
import { logWorkout, updateWorkoutLog } from "./actions"

type Unit = "km" | "m"

// legs lists the leg disciplines of a planned brick, otherwise it is empty
type WorkoutOption = { id: string; label: string; discipline: string; legs: string[] }

type MeasureValues = { distance: string; durationMin: string; avgHeartRate: string }
type LegValues = MeasureValues & { unit: Unit | null }
type FormValues = MeasureValues & { discipline: string; date: string; notes: string }

type EditDetails = {
  logId: string
  workoutTitle: string | null
  distanceUnit: Unit
  values: FormValues
  legDisciplines: string[]
  legs: LegValues[]
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

const EMPTY_LEG: LegValues = { distance: "", durationMin: "", avgHeartRate: "", unit: null }
const DEFAULT_BRICK_LEGS = ["BIKE", "RUN"]

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground placeholder:text-muted"
const labelClass = "block text-sm font-medium text-muted"

type MeasureFieldsProps = {
  prefix: string
  values: MeasureValues
  unit: Unit
  onChange: (field: keyof MeasureValues, value: string) => void
  onUnitChange: (unit: Unit) => void
}

// Duration, distance and heart rate. Used once per session, or once per brick leg.
function MeasureFields({ prefix, values, unit, onChange, onUnitChange }: MeasureFieldsProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${prefix}durationMin`} className={labelClass}>
            Duration (minutes)
          </label>
          <input
            id={`${prefix}durationMin`}
            name={`${prefix}durationMin`}
            type="number"
            required
            min="1"
            step="1"
            inputMode="numeric"
            placeholder="e.g. 45"
            value={values.durationMin}
            onChange={(event) => onChange("durationMin", event.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`${prefix}distance`} className={labelClass}>
            Distance (optional)
          </label>
          <div className="flex gap-2">
            <input
              id={`${prefix}distance`}
              name={`${prefix}distance`}
              type="number"
              min="0"
              step={unit === "m" ? "1" : "0.01"}
              inputMode="decimal"
              placeholder={unit === "m" ? "e.g. 1500" : "e.g. 32.5"}
              value={values.distance}
              onChange={(event) => onChange("distance", event.target.value)}
              className={inputClass}
            />
            <select
              name={`${prefix}distanceUnit`}
              aria-label="Distance unit"
              value={unit}
              onChange={(event) => onUnitChange(event.target.value as Unit)}
              className="mt-1 rounded-lg border border-border bg-surface px-2 py-2 text-foreground"
            >
              <option value="km">km</option>
              <option value="m">m</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor={`${prefix}avgHeartRate`} className={labelClass}>
          Average heart rate (bpm, optional)
        </label>
        <input
          id={`${prefix}avgHeartRate`}
          name={`${prefix}avgHeartRate`}
          type="number"
          min="30"
          max="250"
          step="1"
          inputMode="numeric"
          placeholder="e.g. 142"
          value={values.avgHeartRate}
          onChange={(event) => onChange("avgHeartRate", event.target.value)}
          className={inputClass}
        />
      </div>
    </>
  )
}

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
  const [unitChoice, setUnitChoice] = useState<Unit | null>(edit?.distanceUnit ?? null)
  const [legs, setLegs] = useState<LegValues[]>(edit?.legs ?? [])

  const selected = workouts.find((workout) => workout.id === workoutId)
  const isPlanned = edit ? edit.workoutTitle !== null : Boolean(selected)
  const discipline = selected?.discipline ?? values.discipline
  const isBrick = discipline === "BRICK"

  // A brick is logged leg by leg: the plan's legs, the saved legs, or bike then run
  let legDisciplines: string[] = []
  if (isBrick) {
    if (edit && edit.legDisciplines.length > 1) legDisciplines = edit.legDisciplines
    else if (selected && selected.legs.length > 1) legDisciplines = selected.legs
    else legDisciplines = DEFAULT_BRICK_LEGS
  }

  // Swims default to metres, everything else to kilometres
  const unit = unitChoice ?? (discipline === "SWIM" ? "m" : "km")

  // Fields are controlled, so a failed submit does not wipe what the user typed
  function handleChange(field: "discipline" | "date" | "notes") {
    return (
      event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => setValues((previous) => ({ ...previous, [field]: event.target.value }))
  }

  function changeLeg(index: number, change: (leg: LegValues) => LegValues) {
    setLegs((previous) => {
      const next = [...previous]
      while (next.length <= index) next.push({ ...EMPTY_LEG })
      next[index] = change(next[index])
      return next
    })
  }

  return (
    <form action={formAction} className="space-y-4">
      {edit && <input type="hidden" name="logId" value={edit.logId} />}

      {edit ? (
        <p className="text-sm text-muted">{edit.workoutTitle ?? "Unplanned session"}</p>
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
          Discipline: {formatEnum(discipline)} (from your plan)
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
            {DISCIPLINES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
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

      {isBrick ? (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Log each leg separately, so TriSync can compare, for example, your run after
            the bike with your normal runs.
          </p>
          {legDisciplines.map((legDiscipline, index) => {
            const leg = legs[index] ?? EMPTY_LEG
            return (
              <fieldset
                key={`${index}-${legDiscipline}`}
                className="space-y-4 rounded-lg border border-border p-4"
              >
                <legend className="px-1 text-sm font-semibold text-foreground">
                  Leg {index + 1}: {formatEnum(legDiscipline)}
                </legend>
                <MeasureFields
                  prefix={`leg${index}_`}
                  values={leg}
                  unit={leg.unit ?? (legDiscipline === "SWIM" ? "m" : "km")}
                  onChange={(field, value) =>
                    changeLeg(index, (current) => ({ ...current, [field]: value }))
                  }
                  onUnitChange={(next) =>
                    changeLeg(index, (current) => ({ ...current, unit: next }))
                  }
                />
              </fieldset>
            )
          })}
        </div>
      ) : (
        <MeasureFields
          prefix=""
          values={values}
          unit={unit}
          onChange={(field, value) =>
            setValues((previous) => ({ ...previous, [field]: value }))
          }
          onUnitChange={setUnitChoice}
        />
      )}

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
          <Link href="/log-workout" className="text-sm text-muted hover:underline">
            Cancel
          </Link>
        )}
      </div>
    </form>
  )
}