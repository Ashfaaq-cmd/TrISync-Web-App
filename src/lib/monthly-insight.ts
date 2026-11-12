import { getAnalysisData } from "@/lib/analysis"
import { buildMonthlyFacts, getPeriods } from "@/lib/monthly-facts"
import { prisma } from "@/lib/prisma"
import { MS_PER_DAY, startOfDay } from "@/lib/weekly-volume"

// Everything here is limited to the signed-in user's own data
export async function loadMonthlyFacts(userId: string, now: Date) {
  const today = startOfDay(now)
  const { monthStart, previousStart } = getPeriods(today)

  const [logs, plan, analysis] = await Promise.all([
    prisma.workoutLog.findMany({
      where: { userId, date: { gte: previousStart, lte: today } },
      select: { date: true, discipline: true, durationMin: true, distanceKm: true },
    }),
    prisma.trainingPlan.findFirst({
      where: { userId, status: "ACTIVE" },
      select: {
        startDate: true,
        workouts: {
          where: { discipline: { not: "REST" } },
          select: {
            weekNumber: true,
            dayOfWeek: true,
            _count: { select: { logs: true } },
          },
        },
      },
    }),
    getAnalysisData(userId, now),
  ])

  // Planned workouts that fell due between the start of the month and today
  let adherence: { done: number; due: number } | null = null
  if (plan) {
    const due = plan.workouts.filter((workout) => {
      const day =
        plan.startDate.getTime() +
        ((workout.weekNumber - 1) * 7 + (workout.dayOfWeek - 1)) * MS_PER_DAY
      return day >= monthStart.getTime() && day <= today.getTime()
    })
    if (due.length > 0) {
      adherence = {
        due: due.length,
        done: due.filter((workout) => workout._count.logs > 0).length,
      }
    }
  }

  const built = buildMonthlyFacts({
    today,
    logs,
    adherence,
    brickComparison: analysis.brick.comparison,
  })

  return { monthStart, today, ...built }
}

export function getMonthlySummaries(userId: string) {
  return prisma.performanceInsight.findMany({
    where: { userId, summary: { not: null } },
    orderBy: { periodStart: "desc" },
    take: 4,
  })
}