import type { Discipline } from "@/generated/prisma"
import { prisma } from "@/lib/prisma"
import { buildWeeklyVolume, getFirstWeekStart } from "@/lib/weekly-volume"

export const ANALYSIS_WEEKS = 12
// Placeholders: the least data before a trend or comparison is shown
export const MIN_POINTS = 3
export const MIN_BRICK_SAMPLE = 3

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
})

export type ProgressPoint = { date: string; value: number }

export type AnalysisLog = {
  date: Date
  discipline: Discipline
  durationMin: number | null
  distanceKm: number | null
  avgHeartRate: number | null
  avgPaceSecKm: number | null
  avgSpeedKmh: number | null
  legs: {
    discipline: Discipline
    durationMin: number
    distanceKm: number | null
    avgHeartRate: number | null
  }[]
}

export type BrickComparison = {
  brickPaceSecKm: number
  standalonePaceSecKm: number
  // Positive means the run after the bike was slower
  differenceSec: number
  brickHeartRate: number | null
  standaloneHeartRate: number | null
}

type Measured = {
  durationMin: number | null
  distanceKm: number | null
  avgHeartRate: number | null
}

// Total time divided by total distance, so a long run counts for more than a short one
function pooledPace(items: Measured[]) {
  const usable = items.filter((item) => item.durationMin && item.distanceKm)
  if (usable.length === 0) return null
  const seconds = usable.reduce((sum, item) => sum + (item.durationMin ?? 0) * 60, 0)
  const km = usable.reduce((sum, item) => sum + (item.distanceKm ?? 0), 0)
  return seconds / km
}

// Heart rate weighted by how long each session lasted
function weightedHeartRate(items: Measured[]) {
  const usable = items.filter((item) => item.durationMin && item.avgHeartRate)
  if (usable.length === 0) return null
  const minutes = usable.reduce((sum, item) => sum + (item.durationMin ?? 0), 0)
  const total = usable.reduce(
    (sum, item) => sum + (item.durationMin ?? 0) * (item.avgHeartRate ?? 0),
    0
  )
  return total / minutes
}

// Pure calculation: no database, so it can be tested and reused
export function buildAnalysis(logs: AnalysisLog[], now: Date) {
  const { volume } = buildWeeklyVolume(logs, now, ANALYSIS_WEEKS)

  const progress = (
    discipline: Discipline,
    pick: (log: AnalysisLog) => number | null
  ): ProgressPoint[] =>
    logs.flatMap((log) => {
      const value = log.discipline === discipline ? pick(log) : null
      return value ? [{ date: dateFormatter.format(log.date), value }] : []
    })

  const run = progress("RUN", (log) => log.avgPaceSecKm)
  const bike = progress("BIKE", (log) => log.avgSpeedKmh)
  // Swim pace is shown per 100 m
  const swim = progress("SWIM", (log) => (log.avgPaceSecKm ? log.avgPaceSecKm / 10 : null))

  // Run legs in bricks (logged leg by leg) against standalone runs
  const brickRunLegs = logs
    .filter((log) => log.discipline === "BRICK")
    .flatMap((log) =>
      log.legs.filter((leg) => leg.discipline === "RUN" && leg.durationMin && leg.distanceKm)
    )
  const standaloneRuns = logs.filter(
    (log) => log.discipline === "RUN" && log.durationMin && log.distanceKm
  )

  let comparison: BrickComparison | null = null
  if (brickRunLegs.length >= MIN_BRICK_SAMPLE && standaloneRuns.length >= MIN_BRICK_SAMPLE) {
    const brickPace = pooledPace(brickRunLegs)
    const standalonePace = pooledPace(standaloneRuns)
    if (brickPace !== null && standalonePace !== null) {
      const brickHeartRate = weightedHeartRate(brickRunLegs)
      const standaloneHeartRate = weightedHeartRate(standaloneRuns)
      comparison = {
        brickPaceSecKm: Math.round(brickPace),
        standalonePaceSecKm: Math.round(standalonePace),
        differenceSec: Math.round(brickPace - standalonePace),
        brickHeartRate: brickHeartRate === null ? null : Math.round(brickHeartRate),
        standaloneHeartRate:
          standaloneHeartRate === null ? null : Math.round(standaloneHeartRate),
      }
    }
  }

  return {
    volume,
    run,
    bike,
    swim,
    brick: {
      brickRunLegs: brickRunLegs.length,
      standaloneRuns: standaloneRuns.length,
      comparison,
    },
  }
}

export async function getAnalysisData(userId: string, now: Date) {
  const logs = await prisma.workoutLog.findMany({
    where: { userId, date: { gte: getFirstWeekStart(now, ANALYSIS_WEEKS) } },
    orderBy: { date: "asc" },
    select: {
      date: true,
      discipline: true,
      durationMin: true,
      distanceKm: true,
      avgHeartRate: true,
      avgPaceSecKm: true,
      avgSpeedKmh: true,
      legs: {
        select: {
          discipline: true,
          durationMin: true,
          distanceKm: true,
          avgHeartRate: true,
        },
      },
    },
  })

  return buildAnalysis(logs, now)
}