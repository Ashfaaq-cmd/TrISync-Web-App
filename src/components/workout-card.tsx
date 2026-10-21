import Link from "next/link"
import type { PlanWorkout } from "@/lib/training-plan"
import {
  DISCIPLINE_CHIP_STYLES,
  DISCIPLINE_LABELS,
  formatEnum,
} from "@/lib/discipline"

function describeSegment(segment: PlanWorkout["segments"][number]) {
  const parts = [DISCIPLINE_LABELS[segment.discipline]]
  if (segment.targetDurationMin) parts.push(`${segment.targetDurationMin} min`)
  if (segment.targetDistanceKm) parts.push(`${segment.targetDistanceKm} km`)
  if (segment.targetIntensity) parts.push(segment.targetIntensity)
  return parts.join(" · ")
}

export default function WorkoutCard({ workout }: { workout: PlanWorkout }) {
  const content = (
    <>
      <span
        className={`inline-block rounded-full border px-2 py-0.5 text-xs font-bold ${DISCIPLINE_CHIP_STYLES[workout.discipline]}`}
      >
        {DISCIPLINE_LABELS[workout.discipline]}
      </span>
      <h3 className="mt-2 font-semibold text-foreground">{workout.title}</h3>

      {workout.segments.length > 0 && (
        <ul className="mt-1 space-y-0.5 text-sm text-muted">
          {workout.segments.map((segment) => (
            <li key={segment.id}>{describeSegment(segment)}</li>
          ))}
        </ul>
      )}

      {workout.muscleGroups.length > 0 && (
        <p className="mt-2 text-xs text-muted">
          Muscles: {workout.muscleGroups.map(formatEnum).join(", ")}
        </p>
      )}
    </>
  )

  // Rest days have nothing to open, so they are not links
  if (workout.discipline === "REST") {
    return (
      <article className="rounded-lg border border-border bg-surface p-4">
        {content}
      </article>
    )
  }

  return (
    <Link
      href={`/training-plan/${workout.id}`}
      className="block rounded-lg border border-border bg-surface p-4 hover:border-primary"
    >
      {content}
    </Link>
  )
}