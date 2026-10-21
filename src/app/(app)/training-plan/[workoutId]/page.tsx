import Link from "next/link"
import { notFound } from "next/navigation"
import PageHeader from "@/components/page-header"
import ProtectedPage from "@/components/protected-page"
import { formatWorkoutDate } from "@/lib/dates"
import {
  DISCIPLINE_CHIP_STYLES,
  DISCIPLINE_LABELS,
  formatEnum,
} from "@/lib/discipline"
import { requireOnboardedUser } from "@/lib/session"
import { getWorkoutForUser } from "@/lib/training-plan"

type PageProps = { params: Promise<{ workoutId: string }> }
export default function WorkoutDetailsPage({ params }: PageProps){
    return (
        <ProtectedPage>
            <WorkoutContent params={params}/>
        </ProtectedPage>
    )
}

async function WorkoutContent({ params }: PageProps) {
    const { user } = await requireOnboardedUser()
    const { workoutId } = await params

    //only returns the workout if it belongs to this user
    const workout = await getWorkoutForUser(user.id, workoutId)
    if(!workout) notFound()

        const date = formatWorkoutDate(
            workout.plan.startDate, workout.weekNumber,workout.dayOfWeek
        )

        const totalMinutes = workout.segments.reduce((sum, segment)=> sum + (segment.targetDurationMin ?? 0),0)

    return(
        <>
        <PageHeader title={workout.title} subtitle={`${date} . Week ${workout.weekNumber}`}
        />
        <div className="max-w-2xl space-y-6 p-6 md:p-10">
            <Link href={`/training-plan?week=${workout.weekNumber}`} className="text-sm font-medium text-link hover:underline">← Back to Week {workout.weekNumber}
            </Link>

            <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full border px-2 py-0.5 text xs font-bold ${DISCIPLINE_CHIP_STYLES[workout.discipline]}`}>{DISCIPLINE_LABELS[workout.discipline]}
                </span>
                {totalMinutes > 0 && (
                    <span className="text-sm text-muted">{totalMinutes} min in total</span>
                )}
            </div>

           {workout.description && (
          <section>
            <h2 className="mb-1 text-xs font-bold uppercase text-muted">
              Description
            </h2>
            <p className="text-foreground">{workout.description}</p>
          </section>
        )}

 {workout.segments.length > 0 && (
          <section>
            <h2 className="mb-2 text-xs font-bold uppercase text-muted">
              {workout.segments.length > 1 ? "Segments, in order" : "Target"}
            </h2>
            <div className="space-y-3">
              {workout.segments.map((segment) => (
                <div
                  key={segment.id}
                  className="rounded-lg border border-border bg-surface p-4"
                >
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-xs font-bold ${DISCIPLINE_CHIP_STYLES[segment.discipline]}`}
                  >
                    {DISCIPLINE_LABELS[segment.discipline]}
                  </span>
                  <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <dt className="text-muted">Duration</dt>
                      <dd className="font-semibold text-foreground">
                        {segment.targetDurationMin
                          ? `${segment.targetDurationMin} min`
                          : "Not set"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">Distance</dt>
                      <dd className="font-semibold text-foreground">
                        {segment.targetDistanceKm
                          ? `${segment.targetDistanceKm} km`
                          : "Not set"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">Intensity</dt>
                      <dd className="font-semibold text-foreground">
                        {segment.targetIntensity ?? "Not set"}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </section>
        )}

        {workout.muscleGroups.length > 0 && (
          <section>
            <h2 className="mb-2 text-xs font-bold uppercase text-muted">
              Muscle groups targeted
            </h2>
            <div className="flex flex-wrap gap-2">
              {workout.muscleGroups.map((muscle) => (
                <span
                  key={muscle}
                  className="rounded-full bg-primary-soft px-3 py-1 text-xs text-foreground"
                >
                  {formatEnum(muscle)}
                </span>
              ))}
            </div>
          </section>
        )}

        {workout.discipline !== "REST" && (
          <Link
            href={`/log-workout?workoutId=${workout.id}`}
            className="inline-block rounded-lg bg-primary px-5 py-2 font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Log this workout
          </Link>
        )}
      </div>
    </>
    )
}