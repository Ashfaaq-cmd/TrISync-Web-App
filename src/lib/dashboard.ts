import type { Discipline } from "@/generated/prisma"
import { prisma } from "@/lib/prisma"
import { getRecentLogs } from "@/lib/workout-log"

export type VolumeDiscipline = Exclude<Discipline, "REST">
export type WeekVolume = { week: string } & Record<VolumeDiscipline, number>

export const VOLUME_DISCIPLINES: VolumeDiscipline[] = [
  "SWIM",
  "BIKE",
  "RUN",
  "BRICK",
  "STRENGTH",
]

const WEEKS_SHOWN = 8
const MS_PER_DAY = 24 * 60 * 60 * 1000
const MS_PER_WEEK = 7 * MS_PER_DAY

const weekLabelFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
})

function startOfDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
}

// Midnight (UTC) on the Monday of the week that contains the date
function startOfWeek(date: Date) {
  const day = startOfDay(date)
  day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7))
  return day
}

// Of the planned workouts due so far this plan week, how many were logged?
async function getAdherence(userId: string, now: Date) {
  const plan = await prisma.trainingPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    select: {
      startDate: true,
      totalWeeks: true,
      workouts: {
        where: { discipline: { not: "REST" } },
        select: {
          weekNumber: true,
          dayOfWeek: true,
          _count: { select: { logs: true } },
        },
      },
    },
  })
  if (!plan) return null

  const today = startOfDay(now).getTime()
  const planWeek = Math.floor((today - plan.startDate.getTime()) / MS_PER_WEEK) + 1
  // Not started yet, or already finished
  if (planWeek < 1 || planWeek > plan.totalWeeks) return null

  const due = plan.workouts.filter((workout) => {
    const workoutDay =
      plan.startDate.getTime() +
      ((workout.weekNumber - 1) * 7 + (workout.dayOfWeek - 1)) * MS_PER_DAY
    return workout.weekNumber === planWeek && workoutDay <= today
  })
  if (due.length === 0) return null

  const done = due.filter((workout) => workout._count.logs > 0).length
  return { done, due: due.length, percent: Math.round((done / due.length) * 100) }
}

export async function getDashboardData(userId: string, now: Date) {
  const thisWeekStart = startOfWeek(now)
  const firstWeekStart = new Date(
    thisWeekStart.getTime() - (WEEKS_SHOWN - 1) * MS_PER_WEEK
  )

  const [logs, recentLogs, adherence] = await Promise.all([
    prisma.workoutLog.findMany({
      where: { userId, date: { gte: firstWeekStart } },
      select: { date: true, discipline: true, durationMin: true, distanceKm: true },
    }),
    getRecentLogs(userId, 5),
    getAdherence(userId, now),
  ])

  const volume: WeekVolume[] = Array.from({ length: WEEKS_SHOWN }, (_, index) => ({
    week: weekLabelFormatter.format(
      new Date(firstWeekStart.getTime() + index * MS_PER_WEEK)
    ),
    SWIM: 0,
    BIKE: 0,
    RUN: 0,
    BRICK: 0,
    STRENGTH: 0,
  }))

  const week = { sessions: 0, totalMinutes: 0, totalDistanceKm: 0 }

  for (const log of logs) {
    const index = Math.floor(
      (startOfWeek(log.date).getTime() - firstWeekStart.getTime()) / MS_PER_WEEK
    )
    // Ignore anything outside the weeks shown (for example a log dated tomorrow)
    if (index < 0 || index >= WEEKS_SHOWN || log.discipline === "REST") continue

    volume[index][log.discipline] += log.durationMin ?? 0

    if (index === WEEKS_SHOWN - 1) {
      week.sessions += 1
      week.totalMinutes += log.durationMin ?? 0
      week.totalDistanceKm += log.distanceKm ?? 0
    }
  }

  // The chart shows hours, rounded to one decimal
  for (const entry of volume) {
    for (const discipline of VOLUME_DISCIPLINES) {
      entry[discipline] = Math.round(entry[discipline] / 6) / 10
    }
  }
  week.totalDistanceKm = Math.round(week.totalDistanceKm * 10) / 10

  return { week, volume, adherence, recentLogs }
}