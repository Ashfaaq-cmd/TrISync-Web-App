import type { Discipline, MuscleGroup } from "@/generated/prisma"
import { prisma } from "@/lib/prisma"

// The fields a resource card needs
const listSelect = {
  id: true,
  type: true,
  title: true,
  description: true,
  discipline: true,
  topicTags: true,
  youtubeVideoId: true,
} as const

type Filters = { discipline?: Discipline; muscle?: MuscleGroup }

export async function getLearningResources({ discipline, muscle }: Filters) {
  return prisma.learningResource.findMany({
    where: {
      discipline,
      // "has" matches resources whose muscle list contains this muscle
      muscleGroups: muscle ? { has: muscle } : undefined,
    },
    orderBy: { title: "asc" },
    select: listSelect,
  })
}

export type LearningListItem = Awaited<ReturnType<typeof getLearningResources>>[number]

export async function getLearningResource(id: string) {
  return prisma.learningResource.findUnique({ where: { id } })
}

type WorkoutForMatching = {
  discipline: Discipline
  muscleGroups: MuscleGroup[]
  segments: { discipline: Discipline }[]
}

// Pick the resources that fit a workout best, by discipline and muscle overlap
export async function getRecommendedResources(workout: WorkoutForMatching, take = 3) {
  const segmentDisciplines = workout.segments.map((segment) => segment.discipline)

  const candidates = await prisma.learningResource.findMany({
    where: {
      OR: [
        { discipline: { in: [workout.discipline, ...segmentDisciplines] } },
        { muscleGroups: { hasSome: workout.muscleGroups } },
      ],
    },
    select: { ...listSelect, muscleGroups: true },
  })

  const scored = candidates.map((resource) => {
    let score = 0
    // Same discipline as the workout counts most, a segment match counts less
    if (resource.discipline === workout.discipline) score += 3
    else if (resource.discipline && segmentDisciplines.includes(resource.discipline)) score += 1
    // One point for every muscle group in common
    score += resource.muscleGroups.filter((muscle) =>
      workout.muscleGroups.includes(muscle)
    ).length
    return { resource, score }
  })

  return scored
    .sort((a, b) => b.score - a.score || a.resource.title.localeCompare(b.resource.title))
    .slice(0, take)
    .map((item) => item.resource)
}