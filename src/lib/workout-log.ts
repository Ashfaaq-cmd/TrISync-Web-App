import { prisma } from "@/lib/prisma";
// Planned workouts the user can still log: not rest days, and not logged yet

export async function getLoggableWorkouts(userId:string) {
    return prisma.workout.findMany({
        where: {
            plan: { userId, status: "ACTIVE" },
            discipline: { not:"REST" },
            logs: { none: {} }, // has no logs. Both queries start from the user’s own id, so you can never see someone else’s data.
        },
        orderBy: [{ weekNumber: "asc" }, { dayOfWeek: "asc" }],
        include:{ plan: { select: { startDate: true } } },
    })
    
}
export async function getRecentLogs(userId: string, take = 10) {
  return prisma.workoutLog.findMany({
    where: { userId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take,
    include: { workout: { select: { title: true } } },
  })
}