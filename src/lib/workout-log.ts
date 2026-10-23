import { prisma } from "@/lib/prisma";
import type { Discipline } from "@/generated/prisma";
// Planned workouts the user can still log: not rest days, and not logged yet

export async function getLoggableWorkouts(userId:string) {
    return prisma.workout.findMany({
        where: {
            plan: { userId, status: "ACTIVE" },
            discipline: { not:"REST" },
            logs: { none: {} }, // has no logs. Both queries start from the user’s own id, so you can never see someone else’s data.
        },
        orderBy: [{ weekNumber: "asc" }, { dayOfWeek: "asc" }],
        include:{ plan: { select: { startDate: true } } },
    })
    
}
export async function getRecentLogs(userId: string, take = 10) {
  return prisma.workoutLog.findMany({
    where: { userId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take,
    include: { workout: { select: { title: true } } },
  })
}
// Returns the log only if it belongs to this user, otherwise null
export async function getLogForUser(userId: string, logId: string) {
  return prisma.workoutLog.findFirst({
    where: { id: logId, userId },
    include: { workout: { select: { title: true } } },
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