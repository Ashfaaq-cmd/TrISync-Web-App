import type { Discipline } from "@/generated/prisma"
import { DISCIPLINE_LABELS } from "@/lib/discipline"
import { formatMinSec } from "@/lib/format"

export type SessionNumbers = {
  discipline: Discipline
  durationMin: number | null
  distanceKm: number | null
  avgHeartRate: number | null
  avgPaceSecKm: number | null
  avgSpeedKmh: number | null
}

export type PlannedTarget = {
  title: string
  discipline: Discipline
  totalMinutes: number
  totalKm: number | null
  intensities: string[]
}

export type InsightInput = {
  session: SessionNumbers
  planned: PlannedTarget | null
  // Earlier sessions of the same discipline
  recent: SessionNumbers[]
}

function num(value: number) {
  return String(Math.round(value * 100) / 100)
}

// Swims read better in metres, everything else in kilometres
function distanceText(km: number, discipline: Discipline) {
  return discipline === "SWIM" ? `${Math.round(km * 1000)} m` : `${num(km)} km`
}

function paceText(discipline: Discipline, secPerKm: number) {
  if (discipline === "RUN") return `${formatMinSec(secPerKm)} per km`
  if (discipline === "SWIM") return `${formatMinSec(secPerKm / 10)} per 100 m`
  return null
}

function describe(session: SessionNumbers) {
  const parts: string[] = []
  if (session.durationMin) parts.push(`${num(session.durationMin)} minutes`)
  if (session.distanceKm) parts.push(distanceText(session.distanceKm, session.discipline))
  const pace = session.avgPaceSecKm ? paceText(session.discipline, session.avgPaceSecKm) : null
  if (pace) parts.push(`average pace ${pace}`)
  if (session.discipline === "BIKE" && session.avgSpeedKmh) {
    parts.push(`average speed ${num(session.avgSpeedKmh)} km/h`)
  }
  if (session.avgHeartRate) parts.push(`average heart rate ${num(session.avgHeartRate)} bpm`)
  return parts.join(", ")
}

function average(values: (number | null)[]) {
  const present = values.filter((value): value is number => value !== null && value > 0)
  if (present.length === 0) return null
  return present.reduce((sum, value) => sum + value, 0) / present.length
}

// Plan comparisons are worked out here, so the AI never has to calculate
function compare(name: string, actual: number | null, target: number | null) {
  if (!actual || !target) return null
  const percent = Math.round(((actual - target) / target) * 100)
  if (Math.abs(percent) < 5) return `The ${name} was close to the plan.`
  return `The ${name} was ${Math.abs(percent)}% ${percent > 0 ? "more" : "less"} than planned.`
}

function direction(current: number, previous: number, up: string, down: string) {
  const change = (current - previous) / previous
  if (change > 0.03) return up
  if (change < -0.03) return down
  return "about the same"
}

// The facts the AI may use. Nothing else is ever sent.
export function buildFacts({ session, planned, recent }: InsightInput) {
  const label = DISCIPLINE_LABELS[session.discipline]
  const facts = [`This session: ${label}, ${describe(session)}.`]

  if (planned) {
    const target = [`${num(planned.totalMinutes)} minutes`]
    if (planned.totalKm) target.push(distanceText(planned.totalKm, planned.discipline))
    const intensities = [...new Set(planned.intensities.map((value) => value.toLowerCase()))]
    facts.push(
      `Planned: ${planned.title} (${DISCIPLINE_LABELS[planned.discipline]}), ${target.join(", ")}${
        intensities.length ? `, intensity ${intensities.join(" then ")}` : ""
      }.`
    )
    const duration = compare("duration", session.durationMin, planned.totalMinutes)
    const distance = compare("distance", session.distanceKm, planned.totalKm)
    if (duration) facts.push(duration)
    if (distance) facts.push(distance)
  } else {
    facts.push("This session was not part of the training plan.")
  }

  if (recent.length > 0) {
    const averaged: SessionNumbers = {
      discipline: session.discipline,
      durationMin: average(recent.map((item) => item.durationMin)),
      distanceKm: average(recent.map((item) => item.distanceKm)),
      avgHeartRate: average(recent.map((item) => item.avgHeartRate)),
      avgPaceSecKm: average(recent.map((item) => item.avgPaceSecKm)),
      avgSpeedKmh: average(recent.map((item) => item.avgSpeedKmh)),
    }
    facts.push(`Average of the ${recent.length} previous ${label} sessions: ${describe(averaged)}.`)

    if (session.avgPaceSecKm && averaged.avgPaceSecKm && paceText(session.discipline, 1)) {
      facts.push(
        `Pace compared with the recent average: ${direction(session.avgPaceSecKm, averaged.avgPaceSecKm, "slower", "faster")}.`
      )
    }
    if (session.avgSpeedKmh && averaged.avgSpeedKmh) {
      facts.push(
        `Speed compared with the recent average: ${direction(session.avgSpeedKmh, averaged.avgSpeedKmh, "faster", "slower")}.`
      )
    }
    if (session.avgHeartRate && averaged.avgHeartRate) {
      facts.push(
        `Heart rate compared with the recent average: ${direction(session.avgHeartRate, averaged.avgHeartRate, "higher", "lower")}.`
      )
    }
  } else {
    facts.push(`There are no earlier ${label} sessions to compare with.`)
  }

  return facts
}