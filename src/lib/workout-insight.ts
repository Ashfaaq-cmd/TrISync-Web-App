import type { InsightInput } from "@/lib/ai/insight-facts"
import { prisma } from "@/lib/prisma"

const RECENT_DAYS = 42
const RECENT_COUNT = 4

// Returns null unless the log belongs to this user
export async function getInsightInput(
  userId: string,
  logId: string
): Promise<{ input: InsightInput; hasInsight: boolean } | null> {
  const log = await prisma.workoutLog.findFirst({
    where: { id: logId, userId },
    include: { workout: { include: { segments: true } } },
  })
  if (!log) return null

  const since = new Date(log.date.getTime() - RECENT_DAYS * 24 * 60 * 60 * 1000)
  const recent = await prisma.workoutLog.findMany({
    where: {
      userId,
      discipline: log.discipline,
      id: { not: log.id },
      date: { gte: since, lte: log.date },
    },
    orderBy: { date: "desc" },
    take: RECENT_COUNT,
    select: {
      discipline: true,
      durationMin: true,
      distanceKm: true,
      avgHeartRate: true,
      avgPaceSecKm: true,
      avgSpeedKmh: true,
    },
  })

  const planned = log.workout
    ? {
        title: log.workout.title,
        discipline: log.workout.discipline,
        totalMinutes: log.workout.segments.reduce(
          (sum, segment) => sum + (segment.targetDurationMin ?? 0),
          0
        ),
        totalKm:
          log.workout.segments.reduce(
            (sum, segment) => sum + (segment.targetDistanceKm ?? 0),
            0
          ) || null,
        intensities: log.workout.segments.flatMap((segment) =>
          segment.targetIntensity ? [segment.targetIntensity] : []
        ),
      }
    : null

  return {
    input: {
      session: {
        discipline: log.discipline,
        durationMin: log.durationMin,
        distanceKm: log.distanceKm,
        avgHeartRate: log.avgHeartRate,
        avgPaceSecKm: log.avgPaceSecKm,
        avgSpeedKmh: log.avgSpeedKmh,
      },
      planned,
      recent,
    },
    hasInsight: log.aiInsight !== null,
  }
}