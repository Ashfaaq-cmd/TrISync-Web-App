import { prisma } from "@/lib/prisma"
import {
  buildWeeklyVolume,
  getFirstWeekStart,
  MS_PER_DAY,
  MS_PER_WEEK,
  startOfDay,
} from "@/lib/weekly-volume"
import { getRecentLogs } from "@/lib/workout-log"

const WEEKS_SHOWN = 8

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
  const [logs, recentLogs, adherence] = await Promise.all([
    prisma.workoutLog.findMany({
      where: { userId, date: { gte: getFirstWeekStart(now, WEEKS_SHOWN) } },
      select: { date: true, discipline: true, durationMin: true, distanceKm: true },
    }),
    getRecentLogs(userId, 5),
    getAdherence(userId, now),
  ])

  const { volume, week } = buildWeeklyVolume(logs, now, WEEKS_SHOWN)
  return { week, volume, adherence, recentLogs }
}