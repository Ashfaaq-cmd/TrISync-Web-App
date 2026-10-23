import PageHeader from "@/components/page-header"
import ProtectedPage from "@/components/protected-page"
import {
  DISCIPLINE_CHIP_STYLES,
  DISCIPLINE_LABELS,
} from "@/lib/discipline"
import { formatLogDate, formatWorkoutDate } from "@/lib/dates"
import { requireOnboardedUser } from "@/lib/session"
import { getLoggableWorkouts, getRecentLogs } from "@/lib/workout-log"
import LogWorkoutForm from "./log-workout-form"

type PageProps = {
  searchParams: Promise<{ workoutId?: string; saved?: string }>
}

export default function LogWorkoutPage({ searchParams }: PageProps) {
  return (
    <ProtectedPage>
      <PageHeader title="Log Workout" subtitle="Record a completed session" />
      <LogWorkoutContent searchParams={searchParams} />
    </ProtectedPage>
  )
}

async function LogWorkoutContent({ searchParams }: PageProps) {
  const { user } = await requireOnboardedUser()
  const { workoutId, saved } = await searchParams

  const [workouts, recentLogs] = await Promise.all([
    getLoggableWorkouts(user.id),
    getRecentLogs(user.id),
  ])

  const options = workouts.map((workout) => ({
    id: workout.id,
    discipline: workout.discipline,
    label: `${formatWorkoutDate(workout.plan.startDate, workout.weekNumber, workout.dayOfWeek)} · ${workout.title}`,
  }))

  // Only pre-select a workout that is really in the user's list
  const initialWorkoutId = options.some((option) => option.id === workoutId)
    ? (workoutId ?? "")
    : ""

  const defaultDate = new Date().toISOString().slice(0, 10)

  return (
    <div className="max-w-2xl space-y-8 p-6 md:p-10">
      {saved && (
        <p role="status" className="rounded-lg bg-primary-soft px-4 py-3 text-sm text-success">
          Workout saved.
        </p>
      )}

      <div className="rounded-xl border border-border bg-surface p-6">
        {/* A new key after saving gives an empty form again */}
        <LogWorkoutForm
          key={saved ?? "new"}
          workouts={options}
          initialWorkoutId={initialWorkoutId}
          defaultDate={defaultDate}
        />
      </div>

      <section>
        <h2 className="mb-3 text-xs font-bold uppercase text-muted">
          Recent sessions
        </h2>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-muted">No sessions logged yet.</p>
        ) : (
          <ul className="space-y-3">
            {recentLogs.map((log) => (
              <li
                key={log.id}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-bold ${DISCIPLINE_CHIP_STYLES[log.discipline]}`}
                  >
                    {DISCIPLINE_LABELS[log.discipline]}
                  </span>
                  <span className="text-sm text-muted">{formatLogDate(log.date)}</span>
                </div>
                <p className="mt-2 font-semibold text-foreground">
                  {log.workout?.title ?? "Unplanned session"}
                </p>
                <p className="text-sm text-muted">
                  {[
                    log.durationMin ? `${log.durationMin} min` : null,
                    log.distanceKm ? `${log.distanceKm} km` : null,
                    log.avgHeartRate ? `${log.avgHeartRate} bpm` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}