import Link from "next/link"
import type { ReactNode } from "react"
import PageHeader from "@/components/page-header"
import ProgressChart, { type ProgressKind } from "@/components/progress-chart"
import ProtectedPage from "@/components/protected-page"
import WeeklyVolumeChart from "@/components/weekly-volume-chart"
import {
  ANALYSIS_WEEKS,
  getAnalysisData,
  MIN_BRICK_SAMPLE,
  MIN_POINTS,
  type ProgressPoint,
} from "@/lib/analysis"
import { formatMinSec } from "@/lib/format"
import { requireOnboardedUser } from "@/lib/session"

export default function AnalysisPage() {
  return (
    <ProtectedPage>
      <PageHeader
        title="Performance Analysis"
        subtitle="Trends across swim, bike and run"
      />
      <AnalysisContent />
    </ProtectedPage>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h2 className="mb-4 text-xs font-bold uppercase text-muted">{title}</h2>
      {children}
    </section>
  )
}

type ProgressCardProps = {
  title: string
  kind: ProgressKind
  points: ProgressPoint[]
  hint: string
}

function ProgressCard({ title, kind, points, hint }: ProgressCardProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mb-3 text-xs text-muted">{hint}</p>
      {points.length >= MIN_POINTS ? (
        <ProgressChart kind={kind} points={points} label={`${title} over time`} />
      ) : (
        <p className="py-10 text-center text-sm text-muted">
          Not enough data yet. Log at least {MIN_POINTS} sessions with a distance
          ({points.length} so far).
        </p>
      )}
    </section>
  )
}

function describeDifference(seconds: number) {
  if (Math.abs(seconds) < 5) return "about the same pace as"
  return `${Math.abs(seconds)} seconds per km ${seconds > 0 ? "slower than" : "faster than"}`
}

async function AnalysisContent() {
  const { user } = await requireOnboardedUser()
  const { volume, run, bike, swim, brick } = await getAnalysisData(user.id, new Date())

  const comparison = brick.comparison

  return (
    <div className="space-y-6 p-6 md:p-10">
      <Section title={`Training volume, last ${ANALYSIS_WEEKS} weeks`}>
        <WeeklyVolumeChart data={volume} />
      </Section>

      <div>
        <h2 className="mb-3 text-xs font-bold uppercase text-muted">
          Progress by discipline
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <ProgressCard
            title="Run pace"
            kind="run-pace"
            points={run}
            hint="Each point is one run. Higher on the chart is faster."
          />
          <ProgressCard
            title="Bike speed"
            kind="bike-speed"
            points={bike}
            hint="Each point is one ride. Higher is faster."
          />
          <ProgressCard
            title="Swim pace"
            kind="swim-pace"
            points={swim}
            hint="Each point is one swim, per 100 m. Higher on the chart is faster."
          />
        </div>
      </div>

      <Section title="Run after the bike">
        {comparison ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <p className="text-2xl font-bold text-foreground">
                  {formatMinSec(comparison.brickPaceSecKm)} per km
                </p>
                <p className="text-sm text-muted">
                  Run legs in bricks ({brick.brickRunLegs} sessions)
                </p>
                {comparison.brickHeartRate && (
                  <p className="mt-1 text-xs text-muted">
                    Average heart rate {comparison.brickHeartRate} bpm
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-2xl font-bold text-foreground">
                  {formatMinSec(comparison.standalonePaceSecKm)} per km
                </p>
                <p className="text-sm text-muted">
                  Standalone runs ({brick.standaloneRuns} sessions)
                </p>
                {comparison.standaloneHeartRate && (
                  <p className="mt-1 text-xs text-muted">
                    Average heart rate {comparison.standaloneHeartRate} bpm
                  </p>
                )}
              </div>
            </div>

            <p className="text-foreground">
              After the bike, your runs averaged{" "}
              {describeDifference(comparison.differenceSec)} your standalone runs.
            </p>
            <p className="text-xs text-muted">
              This compares your own sessions over the last {ANALYSIS_WEEKS} weeks. It
              does not show that bricks cause the difference: effort, distance and
              conditions vary between sessions, and the sample is small.
            </p>
          </div>
        ) : (
          <div className="space-y-2 text-sm text-muted">
            <p>
              Not enough data yet. This comparison needs at least {MIN_BRICK_SAMPLE}{" "}
              brick sessions with a run leg and {MIN_BRICK_SAMPLE} standalone runs, each
              with a distance.
            </p>
            <p>
              Found so far: {brick.brickRunLegs} brick run leg
              {brick.brickRunLegs === 1 ? "" : "s"} and {brick.standaloneRuns} standalone
              run{brick.standaloneRuns === 1 ? "" : "s"}.
            </p>
            <p>
              Bricks logged before leg-by-leg logging was added cannot be used.{" "}
              <Link href="/log-workout" className="text-link hover:underline">
                Log a session
              </Link>
            </p>
          </div>
        )}
      </Section>
    </div>
  )
}