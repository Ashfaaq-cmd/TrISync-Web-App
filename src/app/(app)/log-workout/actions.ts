"use server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { Discipline } from "@/generated/prisma"
import { prisma } from "@/lib/prisma"
import { requireOnboardedUser } from "@/lib/session"
import { getWorkoutForUser } from "@/lib/training-plan"
import { derivePaceAndSpeed } from "@/lib/workout-log"
import {
  logDisciplineSchema,
  parseLogFields,
} from "@/lib/validations/workout-log"

export type LogWorkoutState = { error?: string } | undefined

export async function logWorkout(
  _previousState: LogWorkoutState,
  formData: FormData
): Promise<LogWorkoutState> {
  // The user id always comes from the session, never from the form
  const { user } = await requireOnboardedUser()

  const fields = parseLogFields(formData)
  if ("error" in fields) return { error: fields.error }
  const { date, durationMin, distanceKm, avgHeartRate, notes } = fields.data

  const workoutId = String(formData.get("workoutId") ?? "")
  let discipline: Discipline

  if (workoutId) {
    // Only a workout that belongs to this user can be linked
    const workout = await getWorkoutForUser(user.id, workoutId)
    if (!workout) return { error: "That planned workout was not found" }
    if (workout.discipline === "REST") return { error: "Rest days cannot be logged" }

    const alreadyLogged = await prisma.workoutLog.findFirst({
      where: { userId: user.id, workoutId },
    })
    if (alreadyLogged) return { error: "You have already logged this workout" }

    // The plan decides the discipline, not the browser
    discipline = workout.discipline
  } else {
    const parsedDiscipline = logDisciplineSchema.safeParse(formData.get("discipline"))
    if (!parsedDiscipline.success) {
      return { error: parsedDiscipline.error.issues[0].message }
    }
    discipline = parsedDiscipline.data
  }

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
  })
  if (!existing) return { error: "That session was not found" }

  const fields = parseLogFields(formData)
  if ("error" in fields) return { error: fields.error }
  const { date, durationMin, distanceKm, avgHeartRate, notes } = fields.data

  // A planned session keeps its discipline; an unplanned one can change it
  let discipline = existing.discipline
  if (!existing.workoutId) {
    const parsedDiscipline = logDisciplineSchema.safeParse(formData.get("discipline"))
    if (!parsedDiscipline.success) {
      return { error: parsedDiscipline.error.issues[0].message }
    }
    discipline = parsedDiscipline.data
  }

  // Cleared optional fields are set back to empty
  await prisma.workoutLog.update({
    where: { id: existing.id },
    data: {
      discipline,
      date,
      durationMin,
      distanceKm: distanceKm ?? null,
      avgHeartRate: avgHeartRate ?? null,
      notes: notes ?? null,
      ...derivePaceAndSpeed(discipline, durationMin, distanceKm),
    },
  })

  revalidatePath("/log-workout")
  redirect(`/log-workout?saved=${existing.id}`)
}

export async function deleteWorkoutLog(formData: FormData) {
  const { user } = await requireOnboardedUser()
  const logId = String(formData.get("logId") ?? "")

  // Matches on the user as well, so another user's log cannot be deleted
  await prisma.workoutLog.deleteMany({ where: { id: logId, userId: user.id } })

  revalidatePath("/log-workout")
  redirect("/log-workout")
}