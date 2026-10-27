import type { Discipline, MuscleGroup } from "@/generated/prisma";
import { prisma } from "@/lib/prisma"
type Filters = { discipline?: Discipline; muscle?: MuscleGroup }

export async function getLearningResources({ discipline, muscle }:Filters) {
    return prisma.learningResource.findMany({
        where: {
      discipline,
      // "has" matches resources whose muscle list contains this muscle
      muscleGroups: muscle ? { has: muscle } : undefined,
    },
    orderBy: { title: "asc" },
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      discipline: true,
      topicTags: true,
    },
    })
}
    export type LearningListItem = Awaited<ReturnType<typeof getLearningResources>>[number]
    export async function getLearningResource(id:string) {
        return prisma.learningResource.findUnique({ where: { id } })
        
    
}