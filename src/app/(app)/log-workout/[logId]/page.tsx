import Link from "next/link"
import { notFound } from "next/navigation"
import PageHeader from "@/components/page-header"
import ProtectedPage from "@/components/protected-page"
import { requireOnboardedUser } from "@/lib/session"
import { MAX_LEGS } from "@/lib/validations/workout-log"
import { getLogForUser } from "@/lib/workout-log"
import LogWorkoutForm from "../log-workout-form"

type PageProps = { params: Promise<{ logId: string }> }

export default function EditLogPage({ params }: PageProps) {
  return (
    <ProtectedPage>
      <PageHeader title="Edit Session" subtitle="Update a logged workout" />
      <EditLogContent params={params} />
    </ProtectedPage>
  )
}

// Swims are shown in metres, everything else in kilometres
function distanceForForm(km: number | null | undefined, discipline: string) {
  if (km === null || km === undefined) return ""
  return String(discipline === "SWIM" ? Math.round(km * 1000) : km)
}

async function EditLogContent({ params }: PageProps) {
  const { user } = await requireOnboardedUser()
  const { logId } = await params

  // Only returns the log if it belongs to this user
  const log = await getLogForUser(user.id, logId)
  if (!log) notFound()

  // The legs of a brick: the saved ones, else the plan's, else bike then run
  const plannedLegs =
    log.workout?.segments.slice(0, MAX_LEGS).map((segment) => segment.discipline) ?? []
  const legDisciplines: string[] =
    log.discipline !== "BRICK"
      ? []
      : log.legs.length > 0
        ? log.legs.map((leg) => leg.discipline)
        : plannedLegs.length >= 2
          ? plannedLegs
          : ["BIKE", "RUN"]

  const legs = legDisciplines.map((discipline, index) => {
    const saved = log.legs[index]
    return {
      durationMin: saved ? String(saved.durationMin) : "",
      distance: distanceForForm(saved?.distanceKm, discipline),
      avgHeartRate: saved?.avgHeartRate ? String(saved.avgHeartRate) : "",
      unit: discipline === "SWIM" ? ("m" as const) : ("km" as const),
    }
  })

  return (
    <div className="max-w-2xl space-y-6 p-6 md:p-10">
      <Link href="/log-workout" className="text-sm font-medium text-link hover:underline">
        ← Back to Log Workout
      </Link>
      {log.discipline === "BRICK" && log.legs.length === 0 && (
        <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
          This brick was logged as one entry. Enter its legs below so it can be used
          for brick analysis.
        </p>
      )}
      <div className="rounded-xl border border-border bg-surface p-6">
        <LogWorkoutForm
          edit={{
            logId: log.id,
            workoutTitle: log.workout?.title ?? null,
            distanceUnit: log.discipline === "SWIM" ? "m" : "km",
            values: {
              discipline: log.discipline,
              date: log.date.toISOString().slice(0, 10),
              distance: distanceForForm(log.distanceKm, log.discipline),
              durationMin: String(log.durationMin ?? ""),
              avgHeartRate: String(log.avgHeartRate ?? ""),
              notes: log.notes ?? "",
            },
            legDisciplines,
            legs,
          }}
        />
      </div>
    </div>
  )
}