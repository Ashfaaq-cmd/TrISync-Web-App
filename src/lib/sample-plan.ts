import type { TrainingPlanInput, WorkoutInput } from "@/lib/validations/training-plan"

// One week of training. The sample plan repeats it with a changing workload.
const weeklyTemplate: Omit<WorkoutInput, "weekNumber">[] = [
  {
    dayOfWeek: 1,
    discipline: "REST",
    title: "Rest day",
    description: "Full recovery. Light stretching if you feel like it.",
    muscleGroups: [],
    segments: [],
  },
  {
    dayOfWeek: 2,
    discipline: "SWIM",
    title: "Technique and endurance swim",
    description: "Steady swim with drills at the start to work on your stroke.",
    muscleGroups: ["SHOULDERS", "BACK", "CORE"],
    segments: [
      { discipline: "SWIM", targetDistanceKm: 1.5, targetDurationMin: 45, targetIntensity: "Zone 2" },
    ],
  },
  {
    dayOfWeek: 3,
    discipline: "RUN",
    title: "Easy aerobic run",
    description: "Conversational pace. You should be able to talk the whole way.",
    muscleGroups: ["QUADRICEPS", "HAMSTRINGS", "CALVES"],
    segments: [
      { discipline: "RUN", targetDistanceKm: 6, targetDurationMin: 40, targetIntensity: "Zone 2" },
    ],
  },
  {
    dayOfWeek: 4,
    discipline: "BIKE",
    title: "Tempo ride",
    description: "Warm up, then hold a firm but sustainable effort.",
    muscleGroups: ["QUADRICEPS", "GLUTES", "CALVES"],
    segments: [
      { discipline: "BIKE", targetDistanceKm: 30, targetDurationMin: 60, targetIntensity: "Zone 3" },
    ],
  },
  {
    dayOfWeek: 5,
    discipline: "STRENGTH",
    title: "Core and stability",
    description: "Bodyweight core work and hip stability exercises.",
    muscleGroups: ["CORE", "GLUTES", "HIP_FLEXORS"],
    segments: [{ discipline: "STRENGTH", targetDurationMin: 30 }],
  },
  {
    dayOfWeek: 6,
    discipline: "BRICK",
    title: "Bike to run brick session",
    description: "Move from the bike straight into the run to practise the transition.",
    muscleGroups: ["QUADRICEPS", "CALVES", "HIP_FLEXORS"],
    segments: [
      { discipline: "BIKE", targetDistanceKm: 20, targetDurationMin: 45, targetIntensity: "Zone 2" },
      { discipline: "RUN", targetDistanceKm: 2.5, targetDurationMin: 15, targetIntensity: "Zone 2" },
    ],
  },
  {
    dayOfWeek: 7,
    discipline: "RUN",
    title: "Long run",
    description: "Your longest session of the week, at an easy effort.",
    muscleGroups: ["QUADRICEPS", "HAMSTRINGS", "CALVES", "CORE"],
    segments: [
      { discipline: "RUN", targetDistanceKm: 10, targetDurationMin: 70, targetIntensity: "Zone 2" },
    ],
  },
]

// Three build weeks, then an easier recovery week
const weekScale = [1, 1.1, 1.2, 0.8]

export function buildSamplePlan(): TrainingPlanInput {
  const workouts = weekScale.flatMap((scale, index) =>
    weeklyTemplate.map((workout) => ({
      ...workout,
      weekNumber: index + 1,
      segments: workout.segments.map((segment) => ({
        ...segment,
        targetDistanceKm:
          segment.targetDistanceKm &&
          Math.round(segment.targetDistanceKm * scale * 10) / 10,
        targetDurationMin:
          segment.targetDurationMin &&
          Math.round(segment.targetDurationMin * scale),
      })),
    }))
  )

  return {
    title: "Sample Olympic base plan",
    goal: "OLYMPIC",
    totalWeeks: weekScale.length,
    workouts,
  }
}