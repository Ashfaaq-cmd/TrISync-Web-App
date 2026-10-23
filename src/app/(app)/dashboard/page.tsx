import Link from "next/link"
import DisciplineChip from "@/components/discipline-chip"
import PageHeader from "@/components/page-header"
import ProtectedPage from "@/components/protected-page"
import WeeklyVolumeChart from "@/components/weekly-volume-chart"
import { getDashboardData } from "@/lib/dashboard"
import { formatLogDate } from "@/lib/dates"
import { formatDistance } from "@/lib/discipline"
import { formatDuration } from "@/lib/format"
import { requireOnboardedUser } from "@/lib/session"

export default function DashboardPage() {
  return (
    <ProtectedPage>
      <PageHeader
        title="Dashboard"
        subtitle="This week's overview across swim, bike and run"
      />
      <DashboardContent />
    </ProtectedPage>
  )
}

type StatCardProps = { label: string; value: string; hint?: string }

function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}

async function DashboardContent() {
  const { user } = await requireOnboardedUser()
  const { week, volume, adherence, recentLogs } = await getDashboardData(
    user.id,
    new Date()
  )
  const firstName = user.name?.split(" ")[0]

  return (
    <div className="space-y-6 p-6 md:p-10">
      <p className="text-foreground">
        {firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
      </p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Time this week" value={formatDuration(week.totalMinutes)} />
        <StatCard label="Distance this week" value={`${week.totalDistanceKm} km`} />
        <StatCard label="Sessions this week" value={String(week.sessions)} />
        <StatCard
          label="Plan adherence"
          value={adherence ? `${adherence.percent}%` : "—"}
          hint={
            adherence
              ? `${adherence.done} of ${adherence.due} planned workouts done so far`
              : "Shows once planned workouts are due"
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-surface p-5 lg:col-span-2">
          <h2 className="mb-4 text-xs font-bold uppercase text-muted">
            Weekly volume by discipline
          </h2>
          <WeeklyVolumeChart data={volume} />
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase text-muted">Recent activity</h2>
            <Link
              href="/log-workout"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Log a session
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted">No sessions logged yet.</p>
          ) : (
            <ul className="space-y-4">
              {recentLogs.map((log) => (
                <li key={log.id}>
                  <div className="flex items-center justify-between gap-2">
                    <DisciplineChip discipline={log.discipline} />
                    <span className="text-xs text-muted">{formatLogDate(log.date)}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {log.workout?.title ?? "Unplanned session"}
                  </p>
                  <p className="text-xs text-muted">
                    {[
                      log.durationMin ? `${log.durationMin} min` : null,
                      log.distanceKm ? formatDistance(log.distanceKm, log.discipline) : null,
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
    </div>
  )
}