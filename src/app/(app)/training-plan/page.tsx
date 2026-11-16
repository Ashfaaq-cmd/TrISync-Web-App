import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import PageHeader from "@/components/page-header"
import ProtectedPage from "@/components/protected-page"
import WorkoutCard from "@/components/workout-card"
import { formatWorkoutDate } from "@/lib/dates"
import { formatEnum } from "@/lib/discipline"
import { requireOnboardedUser } from "@/lib/session"
import { getActiveTrainingPlan } from "@/lib/training-plan"
import GeneratePlanForm from "./generate-plan-form"

export const maxDuration = 300
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

type PageProps = { searchParams: Promise<{ week?: string }> }

export default function TrainingPlanPage({ searchParams }: PageProps) {
  return (
    <ProtectedPage>
      <PageHeader
        title="Your Training Plan"
        subtitle="Your personalised swim, bike and run schedule"
      />
      <PlanContent searchParams={searchParams} />
    </ProtectedPage>
  )
}

async function PlanContent({ searchParams }: PageProps) {
  const { user } = await requireOnboardedUser()
  const plan = await getActiveTrainingPlan(user.id)

  if (!plan) return <EmptyState />

  // Open on the current week, or on Week 1 if the plan has not started yet
  const weeksElapsed = Math.floor((Date.now() - plan.startDate.getTime()) / MS_PER_WEEK)
  const currentWeek = Math.min(Math.max(weeksElapsed + 1, 1), plan.totalWeeks)

  // The week comes from the URL (?week=2); anything invalid falls back
  const requested = Number((await searchParams).week)
  const week =
    Number.isInteger(requested) && requested >= 1 && requested <= plan.totalWeeks
      ? requested
      : currentWeek

  const weeks = Array.from({ length: plan.totalWeeks }, (_, index) => index + 1)
  const weekWorkouts = plan.workouts.filter((workout) => workout.weekNumber === week)

  return (
    <div className="space-y-6 p-6 md:p-10">
      <p className="text-sm text-muted">
        {plan.title} · {formatEnum(plan.goal)}
        {plan.aiModel && " · AI-generated"}
      </p>

      <p className="rounded-lg border border-border bg-surface px-4 py-3 text-xs text-muted">
        This plan is general training guidance. It is not medical advice and does not
        replace a qualified coach. Stop and seek advice if you feel pain or unwell.
      </p>

      <section
        aria-label="Training plan week"
        className="rounded-xl border border-border bg-surface p-4 sm:flex sm:items-center sm:justify-between sm:gap-6"
      >
        <div className="mb-3 sm:mb-0">
          <h2 className="text-sm font-semibold text-foreground">Plan week</h2>
          <p className="mt-1 text-xs text-muted">
            Week {week} of {plan.totalWeeks}
          </p>
        </div>
        <nav
          aria-label="Week navigation"
          className="flex w-full items-center gap-2 sm:w-auto"
        >
          {week > 1 ? (
            <Link
              href={`/training-plan?week=${week - 1}`}
              aria-label={`Previous week, week ${week - 1}`}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-sidebar focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ChevronLeft aria-hidden="true" size={18} />
            </Link>
          ) : (
            <button
              type="button"
              aria-label="No previous week"
              disabled
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted opacity-50"
            >
              <ChevronLeft aria-hidden="true" size={18} />
            </button>
          )}

          <form
            action="/training-plan"
            method="get"
            className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none"
          >
            <label htmlFor="training-week" className="sr-only">
              Choose a week
            </label>
            <select
              id="training-week"
              name="week"
              defaultValue={String(week)}
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-40 sm:flex-none"
            >
              {weeks.map((weekNumber) => (
                <option key={weekNumber} value={weekNumber}>
                  Week {weekNumber}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Go
            </button>
          </form>

          {week < plan.totalWeeks ? (
            <Link
              href={`/training-plan?week=${week + 1}`}
              aria-label={`Next week, week ${week + 1}`}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-sidebar focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ChevronRight aria-hidden="true" size={18} />
            </Link>
          ) : (
            <button
              type="button"
              aria-label="No next week"
              disabled
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted opacity-50"
            >
              <ChevronRight aria-hidden="true" size={18} />
            </button>
          )}
        </nav>
      </section>

      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
          const dayWorkouts = weekWorkouts.filter((workout) => workout.dayOfWeek === day)

          return (
            <section key={day}>
              <h2 className="mb-2 text-xs font-bold uppercase text-muted">
                {formatWorkoutDate(plan.startDate, week, day)}
              </h2>
              {dayWorkouts.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
                  {dayWorkouts.map((workout) => (
                    <WorkoutCard key={workout.id} workout={workout} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">Nothing planned</p>
              )}
            </section>
          )
        })}
      </div>

      <details className="rounded-lg border border-border bg-surface p-4">
        <summary className="cursor-pointer font-semibold text-foreground">
          Generate a new plan
        </summary>
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted">
            This uses your current profile settings and replaces this plan, which is
            archived. Your logged sessions are kept.
          </p>
          <GeneratePlanForm hasPlan />
        </div>
      </details>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="max-w-xl space-y-4 p-6 md:p-10">
      <p className="text-foreground">You do not have a training plan yet.</p>
      <p className="text-sm text-muted">
        We will build one from your profile: your level, goal, available days and
        session length, plus any recent training you have logged.
      </p>
      <GeneratePlanForm hasPlan={false} />
    </div>
  )
}