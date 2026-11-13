import "dotenv/config"
import { PrismaNeon } from "@prisma/adapter-neon"
import {
  PrismaClient,
  type Discipline,
  type MuscleGroup,
} from "../src/generated/prisma"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type SeedLesson = {
  id: string
  title: string
  description: string
  discipline: Discipline
  muscleGroups: MuscleGroup[]
  topicTags: string[]
  content: string
}

const lessons: SeedLesson[] = [
  {
    id: "seed-lesson-brick-basics",
    title: "Why brick sessions matter",
    description:
      "What a brick session is, why triathletes practise it, and how to approach your first one.",
    discipline: "BRICK",
    muscleGroups: ["QUADRICEPS", "CALVES", "HIP_FLEXORS"],
    topicTags: ["brick training", "transitions"],
    content: `## What a brick session is

A brick session combines two disciplines in a row, most often a bike ride followed immediately by a run.

## Why it matters

Running off the bike feels very different from running on fresh legs. The first few minutes can feel heavy and awkward as your muscles adjust to a new rhythm. Practising this in training helps your body adapt before race day.

## How to approach your first one

- Keep the bike leg easy to moderate.
- Change shoes quickly and start the run at an easy effort.
- Expect the first few minutes to feel strange. That is normal.
- Pay attention to what your legs feel like and use that feedback to set your race pacing.`,
  },
  {
    id: "seed-lesson-swim-breathing",
    title: "Breathing rhythm in freestyle",
    description:
      "Simple ideas for relaxed breathing so you can swim longer without tiring.",
    discipline: "SWIM",
    muscleGroups: ["SHOULDERS", "BACK", "CORE"],
    topicTags: ["swim technique", "breathing"],
    content: `## Breathe out underwater

A lot of swimmers hold their breath and then try to inhale and exhale in the short moment their face is out of the water. Instead, exhale steadily while your face remains in the water so you only need to inhale when you turn to the side.

## Keep your head quiet

Turn your head to the side while keeping one goggle in the water. Lifting your head pushes your hips down and makes the whole stroke feel harder.

## Build a rhythm you can repeat

Choose a pattern that feels sustainable, such as breathing every second or third stroke. Practise it in easy swims before using it under race pressure.`,
  },
  {
    id: "seed-lesson-easy-runs",
    title: "Why easy runs should feel easy",
    description:
      "How easy aerobic running builds fitness and helps you recover between harder sessions.",
    discipline: "RUN",
    muscleGroups: ["QUADRICEPS", "HAMSTRINGS", "CALVES"],
    topicTags: ["run training", "pacing"],
    content: `## What easy really means

An easy run is one where you could hold a conversation. If you are breathing hard enough that you cannot speak in full sentences, you are probably moving too quickly.

## Why it helps

Easy running builds your aerobic base without adding much strain, which helps you recover in time for your harder sessions. Many athletes make their easy days too hard and their hard days not hard enough.

## A simple check

- Can you speak in full sentences?
- Do you finish feeling like you could do more?

If the answer is yes, the effort is likely in the right range.`,
  },
  {
    id: "seed-lesson-core-hips",
    title: "Core and hip stability for triathletes",
    description:
      "Why a stable core and strong hips help all three disciplines, and where to start.",
    discipline: "STRENGTH",
    muscleGroups: ["CORE", "GLUTES", "HIP_FLEXORS"],
    topicTags: ["strength", "injury prevention"],
    content: `## Why the trunk and hips matter

A stable core and strong hips help you hold a better position in the water, stay balanced on the bike and keep your stride steady when running.

## A good starting point

- Short sessions of bodyweight exercises such as planks and glute bridges
- Slow, controlled movements with good form
- Stop if anything hurts and ask a qualified professional for advice

Strength work supports your training. It does not replace it.`,
  },
]

async function main() {
  for (const { id, ...data } of lessons) {
    // Running the seed again updates the lessons instead of duplicating them
    await prisma.learningResource.upsert({
      where: { id },
      create: { id, type: "COACH_LESSON", ...data },
      update: { type: "COACH_LESSON", ...data },
    })
  }
  console.log(`Seeded ${lessons.length} lessons`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())