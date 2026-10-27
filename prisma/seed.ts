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

const SAMPLE_NOTE =
  "*Sample content for development. To be replaced with material written or reviewed by a qualified coach.*"

const lessons: SeedLesson[] = [
  {
    id: "seed-lesson-brick-basics",
    title: "Why brick sessions matter",
    description:
      "What a brick session is, why triathletes practise it, and how to approach your first one.",
    discipline: "BRICK",
    muscleGroups: ["QUADRICEPS", "CALVES", "HIP_FLEXORS"],
    topicTags: ["brick training", "transitions"],
    content: `${SAMPLE_NOTE}

## What is a brick session?

A brick session joins two disciplines back to back, most often a bike ride followed straight away by a run.

## Why practise it?

Running right after cycling feels very different from running on fresh legs. Your legs can feel heavy and your stride can feel unfamiliar for the first few minutes. Practising this in training helps your body and your pacing adjust before race day.

## Your first brick

- Keep the bike leg easy to moderate.
- Change shoes quickly and start the run at an easy effort.
- Expect the first few minutes to feel awkward. That is normal.
- Note how your legs feel and use it to set your race pacing.`,
  },
  {
    id: "seed-lesson-swim-breathing",
    title: "Breathing rhythm in freestyle",
    description:
      "Simple ideas for relaxed breathing so you can swim longer without tiring.",
    discipline: "SWIM",
    muscleGroups: ["SHOULDERS", "BACK", "CORE"],
    topicTags: ["swim technique", "breathing"],
    content: `${SAMPLE_NOTE}

## Breathe out under water

Many swimmers hold their breath and then try to breathe in and out in the short moment their face is out of the water. Instead, breathe out steadily while your face is in the water, so you only need to breathe in when you turn to the side.

## Keep your head low

Turn your head to the side while keeping one goggle in the water. Lifting your head pushes your hips down and makes you work harder.

## Find a rhythm

Choose a pattern you can keep, such as breathing every second or third stroke, and practise it in easy swims before using it in a race.`,
  },
  {
    id: "seed-lesson-easy-runs",
    title: "Why easy runs should feel easy",
    description:
      "How easy aerobic running builds fitness and helps you recover between harder sessions.",
    discipline: "RUN",
    muscleGroups: ["QUADRICEPS", "HAMSTRINGS", "CALVES"],
    topicTags: ["run training", "pacing"],
    content: `${SAMPLE_NOTE}

## What easy means

An easy run is one where you could hold a conversation. If you are out of breath, you are going too fast.

## Why slow down?

Easy running builds your aerobic base without adding much strain, so you recover in time for your harder sessions. Many athletes make their easy days too hard and their hard days not hard enough.

## A simple check

- Can you speak in full sentences?
- Do you finish feeling like you could do more?

If the answer is yes, your pace is probably right.`,
  },
  {
    id: "seed-lesson-core-hips",
    title: "Core and hip stability for triathletes",
    description:
      "Why a stable core and strong hips help all three disciplines, and where to start.",
    discipline: "STRENGTH",
    muscleGroups: ["CORE", "GLUTES", "HIP_FLEXORS"],
    topicTags: ["strength", "injury prevention"],
    content: `${SAMPLE_NOTE}

## Why it matters

A stable trunk helps you hold a good position when swimming, stay balanced on the bike and keep your stride steady when running.

## Where to start

- Short sessions of bodyweight exercises, such as planks and glute bridges
- Keep movements slow and controlled
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