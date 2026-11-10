"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Prisma, type Discipline } from "@/generated/prisma"
import { DISCIPLINE_LABELS } from "@/lib/discipline"
import { prisma } from "@/lib/prisma"
import { requireOnboardedUser } from "@/lib/session"
import { getWorkoutForUser } from "@/lib/training-plan"
import {
  derivePaceAndSpeed,
  legsToCreate,
  summariseLegs,
  type LegInput,
} from "@/lib/workout-log"
import {
  DEFAULT_BRICK_LEGS,
  logDisciplineSchema,
  MAX_LEGS,
  parseMeasures,
  parseSession,
} from "@/lib/validations/workout-log"

export type LogWorkoutState = { error?: string } | undefined

type ParsedSessionData = {
  date: Date
  notes?: string
  durationMin: number
  distanceKm?: number
  avgHeartRate?: number
  legs: LegInput[]
}

type ReadSessionResult = { data: ParsedSessionData } | { error: string }

// The legs of a brick, or none for any other session
function brickLegs(planned: Discipline[]): Discipline[] {
  const legs = planned.slice(0, MAX_LEGS)
  return legs.length >= 2 ? legs : [...DEFAULT_BRICK_LEGS]
}

// Read the form. A brick has one set of measures per leg, and the totals are worked out here.
function readSession(
  formData: FormData,
  legDisciplines: Discipline[]
): ReadSessionResult {
  const session = parseSession(formData)
  if ("error" in session) return { error: session.error }

  if (legDisciplines.length === 0) {
    const measures = parseMeasures(formData)
    if ("error" in measures) return measures
    return { data: { ...session.data, ...measures.data, legs: [] as LegInput[] } }
  }

  const legs: LegInput[] = []
  for (const [index, discipline] of legDisciplines.entries()) {
    const measures = parseMeasures(
      formData,
      `leg${index}_`,
      `${DISCIPLINE_LABELS[discipline]} leg`
    )
    if ("error" in measures) return measures
    legs.push({ discipline, ...measures.data })
  }

  return { data: { ...session.data, ...summariseLegs(legs), legs } }
}

export async function logWorkout(
  _previousState: LogWorkoutState,
  formData: FormData
): Promise<LogWorkoutState> {
  // The user id always comes from the session, never from the form
  const { user } = await requireOnboardedUser()

  const workoutId = String(formData.get("workoutId") ?? "")
  let discipline: Discipline
  let legDisciplines: Discipline[] = []

  if (workoutId) {
    // Only a workout that belongs to this user can be linked
    const workout = await getWorkoutForUser(user.id, workoutId)
    if (!workout) return { error: "That planned workout was not found" }
    if (workout.discipline === "REST") return { error: "Rest days cannot be logged" }

    const alreadyLogged = await prisma.workoutLog.findFirst({
      where: { userId: user.id, workoutId },
    })
    if (alreadyLogged) return { error: "You have already logged this workout" }

    // The plan decides the discipline and the legs, not the browser
    discipline = workout.discipline
    if (discipline === "BRICK") {
      legDisciplines = brickLegs(workout.segments.map((segment) => segment.discipline))
    }
  } else {
    const parsedDiscipline = logDisciplineSchema.safeParse(formData.get("discipline"))
    if (!parsedDiscipline.success) {
      return { error: parsedDiscipline.error.issues[0].message }
    }
    discipline = parsedDiscipline.data
    if (discipline === "BRICK") legDisciplines = brickLegs([])
  }

  const fields = readSession(formData, legDisciplines)
  if ("error" in fields) return { error: fields.error }
  const { date, notes, durationMin, distanceKm, avgHeartRate, legs } = fields.data

  const log = await prisma.workoutLog.create({
    data: {
      userId: user.id,
      workoutId: workoutId || undefined,
      discipline,
      date,
      durationMin,
      distanceKm,
      avgHeartRate,
      notes,
      ...derivePaceAndSpeed(discipline, durationMin, distanceKm),
      legs: { create: legsToCreate(legs) },
    },
  })

  revalidatePath("/log-workout")
  redirect(`/log-workout?saved=${log.id}`)
}

export async function updateWorkoutLog(
  _previousState: LogWorkoutState,
  formData: FormData
): Promise<LogWorkoutState> {
  const { user } = await requireOnboardedUser()

  // The log must exist and belong to this user
  const logId = String(formData.get("logId") ?? "")
  const existing = await prisma.workoutLog.findFirst({
    where: { id: logId, userId: user.id },
    include: {
      legs: { orderBy: { order: "asc" } },
      workout: {
        select: { segments: { select: { discipline: true }, orderBy: { order: "asc" } } },
      },
    },
  })
  if (!existing) return { error: "That session was not found" }

  // A planned session keeps its discipline; an unplanned one can change it
  let discipline = existing.discipline
  if (!existing.workoutId) {
    const parsedDiscipline = logDisciplineSchema.safeParse(formData.get("discipline"))
    if (!parsedDiscipline.success) {
      return { error: parsedDiscipline.error.issues[0].message }
    }
    discipline = parsedDiscipline.data
  }

  // Keep the saved legs; a brick saved before legs existed uses the plan, or bike then run
  let legDisciplines: Discipline[] = []
  if (discipline === "BRICK") {
    legDisciplines =
      existing.legs.length > 0
        ? existing.legs.map((leg) => leg.discipline)
        : brickLegs(existing.workout?.segments.map((segment) => segment.discipline) ?? [])
  }

  const fields = readSession(formData, legDisciplines)
  if ("error" in fields) return { error: fields.error }
  const { date, notes, durationMin, distanceKm, avgHeartRate, legs } = fields.data

  // The old legs are replaced; cleared optional fields are set back to empty
  await prisma.$transaction([
    prisma.workoutLogLeg.deleteMany({ where: { logId: existing.id } }),
    prisma.workoutLog.update({
      where: { id: existing.id },
      data: {
        discipline,
        date,
        durationMin,
        distanceKm: distanceKm ?? null,
        avgHeartRate: avgHeartRate ?? null,
        notes: notes ?? null,
        // Old feedback would no longer match the edited numbers
        aiInsight: Prisma.DbNull,
        ...derivePaceAndSpeed(discipline, durationMin, distanceKm),
        legs: { create: legsToCreate(legs) },
      },
    }),
  ])

  revalidatePath("/log-workout")
  redirect(`/log-workout?saved=${existing.id}`)
}

export async function deleteWorkoutLog(formData: FormData) {
  const { user } = await requireOnboardedUser()
  const logId = String(formData.get("logId") ?? "")

  // Matches on the user as well, so another user's log cannot be deleted.
  // The legs are deleted with it.
  await prisma.workoutLog.deleteMany({ where: { id: logId, userId: user.id } })

  revalidatePath("/log-workout")
  redirect("/log-workout")
}