import type { Discipline } from "@/generated/prisma"
import { prisma } from "@/lib/prisma"

// Planned workouts the user can still log: not rest days, and not logged yet
export async function getLoggableWorkouts(userId: string) {
  return prisma.workout.findMany({
    where: {
      plan: { userId, status: "ACTIVE" },
      discipline: { not: "REST" },
      logs: { none: {} },
    },
    orderBy: [{ weekNumber: "asc" }, { dayOfWeek: "asc" }],
    include: {
      plan: { select: { startDate: true } },
      // The segments decide which legs a planned brick has
      segments: { select: { discipline: true }, orderBy: { order: "asc" } },
    },
  })
}

export async function getRecentLogs(userId: string, take = 10) {
  return prisma.workoutLog.findMany({
    where: { userId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take,
    include: {
      workout: { select: { title: true } },
      legs: { orderBy: { order: "asc" } },
    },
  })
}

// Returns the log only if it belongs to this user, otherwise null
export async function getLogForUser(userId: string, logId: string) {
  return prisma.workoutLog.findFirst({
    where: { id: logId, userId },
    include: {
      workout: {
        select: {
          title: true,
          segments: { select: { discipline: true }, orderBy: { order: "asc" } },
        },
      },
      legs: { orderBy: { order: "asc" } },
    },
  })
}

// Pace and speed only make sense for these single-discipline sessions
const DERIVE_FOR: Discipline[] = ["SWIM", "BIKE", "RUN"]

export function derivePaceAndSpeed(
  discipline: Discipline,
  durationMin: number,
  distanceKm?: number
) {
  if (distanceKm === undefined || !DERIVE_FOR.includes(discipline)) {
    return { avgPaceSecKm: null, avgSpeedKmh: null }
  }
  return {
    avgPaceSecKm: Math.round((durationMin * 60) / distanceKm),
    avgSpeedKmh: Math.round((distanceKm / (durationMin / 60)) * 10) / 10,
  }
}

export type LegInput = {
  discipline: Discipline
  durationMin: number
  distanceKm?: number
  avgHeartRate?: number
}

// The totals saved on the session itself. A partial total would mislead,
// so distance and heart rate are only set when every leg has one.
export function summariseLegs(legs: LegInput[]) {
  const durationMin = legs.reduce((sum, leg) => sum + leg.durationMin, 0)

  const distances = legs.map((leg) => leg.distanceKm)
  const distanceKm = distances.every((distance): distance is number => distance !== undefined)
    ? Math.round(distances.reduce((sum, distance) => sum + distance, 0) * 1000) / 1000
    : undefined

  const heartRates = legs.map((leg) => leg.avgHeartRate)
  const avgHeartRate = heartRates.every((rate): rate is number => rate !== undefined)
    ? Math.round(
        legs.reduce((sum, leg) => sum + leg.durationMin * (leg.avgHeartRate ?? 0), 0) /
          durationMin
      )
    : undefined

  return { durationMin, distanceKm, avgHeartRate }
}

export function legsToCreate(legs: LegInput[]) {
  return legs.map((leg, index) => ({
    order: index + 1,
    discipline: leg.discipline,
    durationMin: leg.durationMin,
    distanceKm: leg.distanceKm,
    avgHeartRate: leg.avgHeartRate,
    ...derivePaceAndSpeed(leg.discipline, leg.durationMin, leg.distanceKm),
  }))
}

// Totals only. No notes or other free text are ever sent to the AI.
export async function getRecentTraining(userId: string, now = new Date()) {
  const weeks = 4
  const since = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000)

  const logs = await prisma.workoutLog.findMany({
    where: { userId, date: { gte: since } },
    select: { discipline: true, durationMin: true },
  })
  if (logs.length === 0) return undefined

  const minutesByDiscipline: Record<string, number> = {}
  for (const log of logs) {
    minutesByDiscipline[log.discipline] =
      (minutesByDiscipline[log.discipline] ?? 0) + (log.durationMin ?? 0)
  }
  return { weeks, sessions: logs.length, minutesByDiscipline }
}