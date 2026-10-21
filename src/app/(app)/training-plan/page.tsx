import PageHeader from "@/components/page-header"
import ProtectedPage from "@/components/protected-page"
import Link from "next/link"
import WorkoutCard from "@/components/workout-card"
import { formatEnum } from "@/lib/discipline"
import { requireOnboardedUser } from "@/lib/session"
import { getActiveTrainingPlan } from "@/lib/training-plan"
import { createSamplePlan } from "./actions"
import { request } from "http"

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
})

const MS_PER_WEEK = 7*24*60*60*1000
type PageProps = { searchParams: Promise<{ week?: string }> }

export default function TrainingPlanPage({ searchParams }: PageProps) {
  return (
    <ProtectedPage>
      <PageHeader
        title="Your Training Plan"
        subtitle="Your personalised swim, bike and run schedule"
      />
      <PlanContent searchParams = {searchParams}/>
    </ProtectedPage>
  )
}

async function PlanContent({ searchParams }: PageProps) {
const { user } = await requireOnboardedUser()
const plan = await getActiveTrainingPlan(user.id)

if(!plan) return <EmptyState />
//Open on the curr week / week 1 if plan has not started
const weeksElapsed = Math.floor((Date.now() - plan.startDate.getTime()) / MS_PER_WEEK)
const currentWeek = Math.min(Math.max(weeksElapsed + 1,1), plan.totalWeeks)

//week comes from the url(?week=2); anything invalid falls back
const requested = Number((await searchParams).week)
const week = Number.isInteger(requested) && requested >= 1 && requested <= plan.totalWeeks 
? requested
: currentWeek

const weeks = Array.from({ length: plan.totalWeeks }, (_, index)=> index +1 )
const weekWorkouts = plan.workouts.filter((workout)=> workout.weekNumber === week)

return(
<div className="space-y-6 p-6 md:p-10">
  <p className="text-sm text-muted">
    {plan.title} . {formatEnum(plan.goal)}
  </p>

  <nav aria-label="Weeks" className="flex gap-2 overflow-x-auto">{weeks.map((weekNumber)=>(
    <Link 
    key={weekNumber}
    href={`/training-plan?week=${weekNumber}`}
    aria-current={weekNumber === week ? "page" : undefined}
    className={`whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-semibold ${weekNumber === week
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-surface text-foreground hover:bg-background"

    }`}
    >
      Week {weekNumber}
    </Link>
  ))}
  </nav>
{[1,2,3,4,5,6,7].map((day)=>{
  const date = new Date(plan.startDate)
  date.setUTCDate(date.getUTCDate() + (week -1 ) * 7 + (day-1))
  const dayWorkouts = weekWorkouts.filter((workout)=> workout.dayOfWeek === day)

  return(
    <section key={day}>
      <h2 className="mb-2 text-xs font-bold uppercase text-muted">
        {dateFormatter.format(date)}
      </h2>
      {dayWorkouts.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {dayWorkouts.map((workout)=>(
           <WorkoutCard key={workout.id} workout={workout}/> 
          ))}
        </div>
  ): (
    <p className="text-sm text-muted">Nothing planned</p>
  )}
    </section>
  )
})}
</div>
)
}
 function EmptyState(){
  return(
    <div className="p-6 md:p-10">
      <p className="text-foreground">You do not have a training plan yet.</p>
      <p className="mt-1 text-sm text-muted">Plan Generation with AI comes later. for now, create a sample plan to test</p>
      {process.env.NODE_ENV !== "production" &&(
        <form action={createSamplePlan} className="mt-4">
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary-hover">Create Sample Plan(dev only)
          </button>
        </form>
      )}
    </div>
  )
 }