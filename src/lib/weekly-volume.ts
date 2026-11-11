import type { Discipline } from "@/generated/prisma"

export type VolumeDiscipline = Exclude<Discipline, "REST">
export type WeekVolume = { week: string } & Record<VolumeDiscipline, number>

export const VOLUME_DISCIPLINES: VolumeDiscipline[] = [
  "SWIM",
  "BIKE",
  "RUN",
  "BRICK",
  "STRENGTH",
]

export const MS_PER_DAY = 24 * 60 * 60 * 1000
export const MS_PER_WEEK = 7 * MS_PER_DAY

const weekLabelFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
})

export function startOfDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
}

// Midnight (UTC) on the Monday of the week that contains the date
export function startOfWeek(date: Date) {
  const day = startOfDay(date)
  day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7))
  return day
}

export function getFirstWeekStart(now: Date, weeksShown: number) {
  return new Date(startOfWeek(now).getTime() - (weeksShown - 1) * MS_PER_WEEK)
}

type VolumeLog = {
  date: Date
  discipline: Discipline
  durationMin: number | null
  distanceKm: number | null
}

// Hours per discipline for each of the last weeks, plus this week's totals
export function buildWeeklyVolume(logs: VolumeLog[], now: Date, weeksShown: number) {
  const firstWeekStart = getFirstWeekStart(now, weeksShown)

  const volume: WeekVolume[] = Array.from({ length: weeksShown }, (_, index) => ({
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
    if (index < 0 || index >= weeksShown || log.discipline === "REST") continue

    volume[index][log.discipline] += log.durationMin ?? 0

    if (index === weeksShown - 1) {
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

  return { volume, week }
}