"use server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { Discipline } from "@/generated/prisma"
import { prisma } from "@/lib/prisma"
import { requireOnboardedUser } from "@/lib/session"
import { getWorkoutForUser } from "@/lib/training-plan"
import {
  logDisciplineSchema,
  workoutLogSchema,
} from "@/lib/validations/workout-log"
export type LogWorkoutState = { error?: string } | undefined

//pace and speed for swim,bike,run
const DERIVE_FOR: Discipline[] = ["SWIM","BIKE","RUN"]

export async function logWorkout( _previousState: LogWorkoutState,
  formData: FormData
): Promise<LogWorkoutState> {
    //userId comes from session not form
    const { user } = await requireOnboardedUser()
    const parsed = workoutLogSchema.safeParse({
        date: formData.get("date") || undefined,
    durationMin: formData.get("durationMin") || undefined,
    distanceKm: formData.get("distanceKm") || undefined,
    avgHeartRate: formData.get("avgHeartRate") || undefined,
    notes: formData.get("notes") || undefined  
})
if(!parsed.success){
    return { error: parsed.error.issues[0].message }
}
const workoutId = String(formData.get("workoutId") ?? "")
let discipline : Discipline
if(workoutId){
    //only workout that belongs to this user can be linked
    const workout = await getWorkoutForUser(user.id, workoutId)
    if(!workout) return { error: "The planned workout was not found" }
    if(workout.discipline === "REST") return { error: "Rest days cannot be logged" }

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

  const { date, durationMin, distanceKm, avgHeartRate, notes } = parsed.data

  // Work out pace (seconds per km) and speed (km/h) from distance and duration
  let avgPaceSecKm: number | undefined
  let avgSpeedKmh: number | undefined
  if (distanceKm !== undefined && DERIVE_FOR.includes(discipline)) {
    avgPaceSecKm = Math.round((durationMin * 60) / distanceKm)
    avgSpeedKmh = Math.round((distanceKm / (durationMin / 60)) * 10) / 10
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
      avgPaceSecKm,
      avgSpeedKmh,
      notes,
    },
  })

  revalidatePath("/log-workout")
  redirect(`/log-workout?saved=${log.id}`)
}