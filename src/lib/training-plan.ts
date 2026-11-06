import { prisma } from "@/lib/prisma";
import type { TrainingPlanInput } from "./validations/training-plan";
import { nextMonday } from "@/lib/dates";
import type { Prisma } from "@/generated/prisma"

export async function saveTrainingPlan(userId: string, plan: TrainingPlanInput, ai?: { aiModel: string; aiPromptVersion: string; aiRawOutput: unknown }){
    const startDate = nextMonday()
    const endDate = new Date(startDate)
    endDate.setUTCDate(endDate.getUTCDate() + plan.totalWeeks * 7 - 1)

    // archive the old plan and create new one together so user never end up with 2 active plans
    const created = await prisma.$transaction(async (tx) => {
        await tx.trainingPlan.updateMany({
            where: { userId, status: "ACTIVE" },
            data: { status: "ARCHIVED" },
        })
        return tx.trainingPlan.create({
            data:{
                userId,
                title: plan.title,
                goal: plan.goal,
                totalWeeks: plan.totalWeeks, startDate,endDate,
                aiModel: ai?.aiModel,
                aiPromptVersion: ai?.aiPromptVersion,
                aiRawOutput: ai?.aiRawOutput as Prisma.InputJsonValue | undefined,
                workouts:{
                    create: plan.workouts.map((workout)=>({
                        weekNumber: workout.weekNumber,
                        dayOfWeek: workout.dayOfWeek,
                        discipline: workout.discipline,
                        title: workout.title,
                        description: workout.description,
                        muscleGroups: workout.muscleGroups,
                        segments:{
                            create: workout.segments.map((segment,index)=>({
                                order: index +1,
                                ...segment,
                            })),
                        },
                    })),
                },
            },
        })
    }, { timeout: 30_000 })
    return created
}

export async function getActiveTrainingPlan(userId: string){
    return prisma.trainingPlan.findFirst({
        where: { userId, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        include: {
            workouts:{
                orderBy:[{ weekNumber: "asc" }, { dayOfWeek: "asc" }],
                include:{ segments: {orderBy:{order:"asc" } } },
            },
        },
    })
}
// Returns the workout only if it belongs to this user, otherwise null
export async function getWorkoutForUser(userId: string, workoutId: string) {
  return prisma.workout.findFirst({
    where: { id: workoutId, plan: { userId } },
    include: {
      plan: { select: { startDate: true } },
      segments: { orderBy: { order: "asc" } },
    },
  })
}

type ActivePlan = NonNullable<Awaited<ReturnType<typeof getActiveTrainingPlan>>>
export type PlanWorkout = ActivePlan["workouts"][number]