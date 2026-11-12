import type { Discipline } from "@/generated/prisma"
import { DISCIPLINE_LABELS } from "@/lib/discipline"
import { formatMinSec } from "@/lib/format"
import { MS_PER_DAY } from "@/lib/weekly-volume"

// Placeholders: the least data before a summary is written
export const MIN_MONTH_SESSIONS = 4
const MIN_PACE_SESSIONS = 2

const ORDER = ["SWIM", "BIKE", "RUN", "BRICK", "STRENGTH"] as const

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
})

export type MonthLog = {
  date: Date
  discipline: Discipline
  durationMin: number | null
  distanceKm: number | null
}

export type MonthlyInput = {
  // Midnight (UTC) of the current day
  today: Date
  logs: MonthLog[]
  adherence: { done: number; due: number } | null
  brickComparison: {
    brickPaceSecKm: number
    standalonePaceSecKm: number
    differenceSec: number
  } | null
}

export function getMonthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

// The month so far, and an equally long period right before it
export function getPeriods(today: Date) {
  const monthStart = getMonthStart(today)
  const days = Math.round((today.getTime() - monthStart.getTime()) / MS_PER_DAY) + 1
  const previousStart = new Date(monthStart.getTime() - days * MS_PER_DAY)
  return { monthStart, days, previousStart }
}

function inPeriod(logs: MonthLog[], from: Date, to: Date) {
  return logs.filter((log) => log.date >= from && log.date <= to)
}

function totalsOf(logs: MonthLog[]) {
  const byDiscipline = new Map<Discipline, { sessions: number; minutes: number }>()
  let minutes = 0
  for (const log of logs) {
    const entry = byDiscipline.get(log.discipline) ?? { sessions: 0, minutes: 0 }
    entry.sessions += 1
    entry.minutes += log.durationMin ?? 0
    byDiscipline.set(log.discipline, entry)
    minutes += log.durationMin ?? 0
  }
  return { sessions: logs.length, minutes, byDiscipline }
}

// Total time over total distance, so a long session counts for more than a short one
function pooled(logs: MonthLog[]) {
  const usable = logs.filter((log) => log.durationMin && log.distanceKm)
  if (usable.length < MIN_PACE_SESSIONS) return null
  const seconds = usable.reduce((sum, log) => sum + (log.durationMin ?? 0) * 60, 0)
  const km = usable.reduce((sum, log) => sum + (log.distanceKm ?? 0), 0)
  return { count: usable.length, secPerKm: seconds / km, kmh: km / (seconds / 3600) }
}

function trend(current: number, previous: number, up: string, down: string, threshold: number) {
  const change = (current - previous) / previous
  if (change > threshold) return up
  if (change < -threshold) return down
  return "about the same"
}

function duration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  if (hours === 0) return `${minutes} minutes`
  return `${hours} ${hours === 1 ? "hour" : "hours"} ${minutes % 60} minutes`
}

// All comparisons are worked out here. The AI is only given the finished sentences.
export function buildMonthlyFacts(input: MonthlyInput): {
  facts: string[] | null
  sessions: number
} {
  const { monthStart, days, previousStart } = getPeriods(input.today)
  const dayBefore = new Date(monthStart.getTime() - MS_PER_DAY)

  const current = inPeriod(input.logs, monthStart, input.today)
  const previous = inPeriod(input.logs, previousStart, dayBefore)

  if (current.length < MIN_MONTH_SESSIONS) return { facts: null, sessions: current.length }

  const now = totalsOf(current)
  const before = totalsOf(previous)

  const facts = [
    `Period: ${dateFormatter.format(monthStart)} to ${dateFormatter.format(input.today)} (${days} days). The comparison period is the ${days} days before it.`,
    `Sessions logged: ${now.sessions} (comparison period: ${before.sessions}).`,
  ]

  if (before.minutes > 0) {
    facts.push(
      `Total training time: ${duration(now.minutes)} (${now.minutes} minutes), compared with ${duration(before.minutes)} (${before.minutes} minutes) in the comparison period: ${trend(now.minutes, before.minutes, "more", "less", 0.05)}.`
    )
  } else {
    facts.push(
      `Total training time: ${duration(now.minutes)} (${now.minutes} minutes). There were no sessions in the comparison period.`
    )
  }

  for (const discipline of ORDER) {
    const a = now.byDiscipline.get(discipline)
    const b = before.byDiscipline.get(discipline)
    if (!a && !b) continue
    facts.push(
      `${DISCIPLINE_LABELS[discipline]}: ${
        a ? `${a.minutes} minutes in ${a.sessions} ${a.sessions === 1 ? "session" : "sessions"}` : "no sessions"
      } (comparison period: ${b ? `${b.minutes} minutes` : "none"}).`
    )
  }

  const split = (discipline: Discipline) => [
    pooled(current.filter((log) => log.discipline === discipline)),
    pooled(previous.filter((log) => log.discipline === discipline)),
  ]

  const [runNow, runBefore] = split("RUN")
  if (runNow && runBefore) {
    facts.push(
      `Run pace: ${formatMinSec(runNow.secPerKm)} per km over ${runNow.count} runs, compared with ${formatMinSec(runBefore.secPerKm)} per km over ${runBefore.count} runs in the comparison period: ${trend(runNow.secPerKm, runBefore.secPerKm, "slower", "faster", 0.03)}.`
    )
  }

  const [swimNow, swimBefore] = split("SWIM")
  if (swimNow && swimBefore) {
    facts.push(
      `Swim pace: ${formatMinSec(swimNow.secPerKm / 10)} per 100 m over ${swimNow.count} swims, compared with ${formatMinSec(swimBefore.secPerKm / 10)} per 100 m over ${swimBefore.count} swims in the comparison period: ${trend(swimNow.secPerKm, swimBefore.secPerKm, "slower", "faster", 0.03)}.`
    )
  }

  const [bikeNow, bikeBefore] = split("BIKE")
  if (bikeNow && bikeBefore) {
    facts.push(
      `Bike speed: ${Math.round(bikeNow.kmh * 10) / 10} km/h over ${bikeNow.count} rides, compared with ${Math.round(bikeBefore.kmh * 10) / 10} km/h over ${bikeBefore.count} rides in the comparison period: ${trend(bikeNow.kmh, bikeBefore.kmh, "faster", "slower", 0.03)}.`
    )
  }

  if (input.adherence && input.adherence.due > 0) {
    const { done, due } = input.adherence
    facts.push(
      `Planned workouts due so far this month: ${due}, of which ${done} were logged (${Math.round((done / due) * 100)}%).`
    )
  }

  if (input.brickComparison) {
    const { brickPaceSecKm, standalonePaceSecKm, differenceSec } = input.brickComparison
    const difference =
      Math.abs(differenceSec) < 5
        ? "about the same pace"
        : `${Math.abs(differenceSec)} seconds per km ${differenceSec > 0 ? "slower" : "faster"} after the bike`
    facts.push(
      `Over the last 12 weeks, run legs in brick sessions averaged ${formatMinSec(brickPaceSecKm)} per km and standalone runs averaged ${formatMinSec(standalonePaceSecKm)} per km (${difference}).`
    )
  } else {
    facts.push("There is not enough brick data yet to compare run legs after the bike.")
  }

  return { facts, sessions: current.length }
}