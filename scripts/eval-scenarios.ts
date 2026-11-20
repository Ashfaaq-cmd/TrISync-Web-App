import type { GeneratePlanInput } from "../src/lib/ai/plan-generation"

const MS_PER_DAY = 24 * 60 * 60 * 1000

// A race date some days ahead, as a plain UTC date
function raceIn(days: number) {
  const date = new Date(Date.now() + days * MS_PER_DAY)
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export type Scenario = { id: string; label: string; build: () => GeneratePlanInput }

// Placeholders: replace or add athletes that matter for your evaluation
export const SCENARIOS: Scenario[] = [
  {
    id: "beginner-fitness",
    label: "Beginner, general fitness, 3 days, 30 min",
    build: () => ({
      experienceLevel: "BEGINNER",
      goal: "GENERAL_FITNESS",
      daysPerWeek: 3,
      minutesPerSession: 30,
      targetRaceDate: null,
      isUnwell: false,
    }),
  },
  {
    id: "beginner-sprint",
    label: "Beginner, sprint, 3 days, 45 min",
    build: () => ({
      experienceLevel: "BEGINNER",
      goal: "SPRINT",
      daysPerWeek: 3,
      minutesPerSession: 45,
      targetRaceDate: null,
      isUnwell: false,
    }),
  },
  {
    id: "beginner-sprint-race",
    label: "Beginner, sprint, 3 days, 45 min, race in about 9 weeks (taper)",
    build: () => ({
      experienceLevel: "BEGINNER",
      goal: "SPRINT",
      daysPerWeek: 3,
      minutesPerSession: 45,
      targetRaceDate: raceIn(63),
      isUnwell: false,
    }),
  },
  {
    id: "intermediate-olympic",
    label: "Intermediate, Olympic, 5 days, 60 min",
    build: () => ({
      experienceLevel: "INTERMEDIATE",
      goal: "OLYMPIC",
      daysPerWeek: 5,
      minutesPerSession: 60,
      targetRaceDate: null,
      isUnwell: false,
    }),
  },
  {
    id: "intermediate-olympic-race",
    label: "Intermediate, Olympic, 4 days, 75 min, race in about 12 weeks",
    build: () => ({
      experienceLevel: "INTERMEDIATE",
      goal: "OLYMPIC",
      daysPerWeek: 4,
      minutesPerSession: 75,
      targetRaceDate: raceIn(84),
      isUnwell: false,
    }),
  },
  {
    id: "intermediate-sprint-history",
    label: "Intermediate, sprint, 4 days, 60 min, with recent training history",
    build: () => ({
      experienceLevel: "INTERMEDIATE",
      goal: "SPRINT",
      daysPerWeek: 4,
      minutesPerSession: 60,
      targetRaceDate: null,
      isUnwell: false,
      recentTraining: {
        weeks: 4,
        sessions: 14,
        minutesByDiscipline: { SWIM: 120, BIKE: 300, RUN: 240 },
      },
    }),
  },
  {
    id: "advanced-half-unwell",
    label: "Advanced, half Ironman, 6 days, 120 min, reports being unwell",
    build: () => ({
      experienceLevel: "ADVANCED",
      goal: "HALF_IRONMAN",
      daysPerWeek: 6,
      minutesPerSession: 120,
      targetRaceDate: null,
      isUnwell: true,
    }),
  },
  {
    id: "advanced-ironman",
    label: "Advanced, Ironman, 6 days, 150 min (the longest plan)",
    build: () => ({
      experienceLevel: "ADVANCED",
      goal: "IRONMAN",
      daysPerWeek: 6,
      minutesPerSession: 150,
      targetRaceDate: null,
      isUnwell: false,
    }),
  },
]