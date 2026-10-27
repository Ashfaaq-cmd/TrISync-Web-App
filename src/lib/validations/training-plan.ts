import { z } from "zod";
import { RACE_GOALS } from '@/lib/validations/onboarding'

const DISCIPLINES = ["SWIM", "BIKE", "RUN","BRICK", "STRENGTH", "REST"] as const
const SEGMENT_DISCIPLINES = ["SWIM", "BIKE", "RUN", "STRENGTH"] as const
export const MUSCLE_GROUPS = [
"QUADRICEPS",
"HAMSTRINGS",
"GLUTES",
"CALVES",
"CORE",
"SHOULDERS",
"BACK",
"CHEST",
"ARMS",
"HIP_FLEXORS",
] as const

const segmentSchema = z.object({
    discipline: z.enum(SEGMENT_DISCIPLINES),
    targetDistanceKm: z.number().positive().optional(),
    targetDurationMin: z.number().int().positive().optional(),
    targetIntensity: z.string().optional(),
})

const workoutSchema = z.object({
    weekNumber: z.number().int().min(1),
    dayOfWeek: z.number().int().min(1).max(7),
    discipline: z.enum(DISCIPLINES),
    title: z.string().min(1),
    description: z.string().optional(),
    muscleGroups: z.array(z.enum(MUSCLE_GROUPS)),
    segments: z.array(segmentSchema),
})
.refine((workout)=>
workout.discipline === "REST"
? workout.segments.length === 0 
: workout.segments.length > 0,
"Rest days have no segments, every other workout needs at least one"
)
.refine(
    (workout)=> workout.discipline !== "BRICK" || workout.segments.length >=2, "A brick workout needs at least two segments"
)

export const trainingPlanSchema = z.object({
    title: z.string().min(1),
    goal: z.enum(RACE_GOALS),
    totalWeeks: z.number().int().min(1).max(24),
    workouts: z.array(workoutSchema).min(1),
})
.refine(
    (plan) => plan.workouts.every((workout) => workout.weekNumber <= plan.totalWeeks),
    "A workout is scheduled after the last week of the plan"
)

export type TrainingPlanInput = z.infer<typeof trainingPlanSchema>
export type WorkoutInput = TrainingPlanInput["workouts"][number]