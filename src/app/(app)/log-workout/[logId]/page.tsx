import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import PageHeader from "@/components/page-header"
import ProtectedPage from "@/components/protected-page"
import { requireOnboardedUser } from "@/lib/session"
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

async function EditLogContent({ params }: PageProps) {
  const { user } = await requireOnboardedUser()
  const { logId } = await params

  // Only returns the log if it belongs to this user
  const log = await getLogForUser(user.id, logId)
  if (!log) notFound()

  // Swims are shown in metres, everything else in kilometres
  const isSwim = log.discipline === "SWIM"
  const distance =
    log.distanceKm === null
      ? ""
      : String(isSwim ? Math.round(log.distanceKm * 1000) : log.distanceKm)

  return (
    <div className="max-w-2xl space-y-6 p-6 md:p-10">
      <Link
        href="/log-workout"
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        Back to Log Workout
      </Link>
      <div className="rounded-xl border border-border bg-surface p-6">
        <LogWorkoutForm
          edit={{
            logId: log.id,
            workoutTitle: log.workout?.title ?? null,
            distanceUnit: isSwim ? "m" : "km",
            values: {
              discipline: log.discipline,
              date: log.date.toISOString().slice(0, 10),
              distance,
              durationMin: String(log.durationMin ?? ""),
              avgHeartRate: String(log.avgHeartRate ?? ""),
              notes: log.notes ?? "",
            },
          }}
        />
      </div>
    </div>
  )
}