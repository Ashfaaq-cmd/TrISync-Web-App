import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  // The user always comes from the session
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return new Response("Please sign in first.", { status: 401 })

  // Selected field by field: no password hash, no tokens, no raw AI output
  const data = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      image: true,
      createdAt: true,
      profile: {
        select: {
          experienceLevel: true,
          goal: true,
          daysPerWeek: true,
          minutesPerSession: true,
          targetRaceDate: true,
        },
      },
      trainingPlans: {
        orderBy: { createdAt: "desc" },
        select: {
          title: true,
          status: true,
          goal: true,
          startDate: true,
          endDate: true,
          totalWeeks: true,
          aiModel: true,
          aiPromptVersion: true,
          createdAt: true,
          workouts: {
            orderBy: [{ weekNumber: "asc" }, { dayOfWeek: "asc" }],
            select: {
              weekNumber: true,
              dayOfWeek: true,
              discipline: true,
              title: true,
              description: true,
              muscleGroups: true,
              segments: {
                orderBy: { order: "asc" },
                select: {
                  order: true,
                  discipline: true,
                  targetDistanceKm: true,
                  targetDurationMin: true,
                  targetIntensity: true,
                },
              },
            },
          },
        },
      },
      workoutLogs: {
        orderBy: { date: "desc" },
        select: {
          date: true,
          discipline: true,
          durationMin: true,
          distanceKm: true,
          avgHeartRate: true,
          avgPaceSecKm: true,
          avgSpeedKmh: true,
          notes: true,
          aiInsight: true,
          createdAt: true,
          workout: { select: { title: true } },
          legs: {
            orderBy: { order: "asc" },
            select: {
              order: true,
              discipline: true,
              durationMin: true,
              distanceKm: true,
              avgHeartRate: true,
              avgPaceSecKm: true,
              avgSpeedKmh: true,
            },
          },
        },
      },
      performanceInsights: {
        orderBy: { periodStart: "desc" },
        select: {
          periodStart: true,
          periodEnd: true,
          headline: true,
          summary: true,
          suggestion: true,
          facts: true,
          aiModel: true,
          createdAt: true,
        },
      },
    },
  })
  if (!data) return new Response("Account not found.", { status: 404 })

  return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), ...data }, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="trisync-data.json"',
      "Cache-Control": "no-store",
    },
  })
}