import { prisma } from "@/lib/prisma";
import type { TrainingPlanInput } from "./validations/training-plan";

//Plans start on next Mon, dates stored as plain UTC dates so server time zone cannot shift them by a day

function nextMonday(from = new Date()){
    const date = new Date(
        Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())
    )
    const daysUntilMonday = (8 - date.getUTCDay()) % 7 || 7 
    date.setUTCDate(date.getUTCDate() + daysUntilMonday)
    return date
}

export async function saveTrainingPlan(userId: string, plan: TrainingPlanInput){
    const startDate = nextMonday()
    const endDate = new Date(startDate)
    endDate.setUTCDate(endDate.getUTCDate() + plan.totalWeeks * 7 - 1)

    // archive the old plan and create new one together so user never end up with 2 active plans
    const[, created] = await prisma.$transaction([
        prisma.trainingPlan.updateMany({
            where: { userId, status: "ACTIVE" },
            data: { status: "ARCHIVED" },
        }),
        prisma.trainingPlan.create({
            data:{
                userId,
                title: plan.title,
                goal: plan.goal,
                totalWeeks: plan.totalWeeks, startDate,endDate,
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
        }),
    ])
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
type ActivePlan = NonNullable<Awaited<ReturnType<typeof getActiveTrainingPlan>>>
export type PlanWorkout = ActivePlan["workouts"][number]