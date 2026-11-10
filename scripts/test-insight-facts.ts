import { buildFacts, type InsightInput } from "../src/lib/ai/insight-facts"
import { buildInsightPrompt } from "../src/lib/ai/insight-prompt"

const run: InsightInput = {
  session: {
    discipline: "RUN",
    durationMin: 42,
    distanceKm: 6,
    avgHeartRate: 152,
    avgPaceSecKm: 420,
    avgSpeedKmh: 8.6,
  },
  planned: {
    title: "Easy aerobic run",
    discipline: "RUN",
    totalMinutes: 40,
    totalKm: 6,
    intensities: ["EASY"],
  },
  recent: [
    { discipline: "RUN", durationMin: 38, distanceKm: 5.5, avgHeartRate: 148, avgPaceSecKm: 415, avgSpeedKmh: 8.7 },
    { discipline: "RUN", durationMin: 40, distanceKm: 6, avgHeartRate: 150, avgPaceSecKm: 400, avgSpeedKmh: 9 },
  ],
}

const swim: InsightInput = {
  session: {
    discipline: "SWIM",
    durationMin: 30,
    distanceKm: 1,
    avgHeartRate: null,
    avgPaceSecKm: 1800,
    avgSpeedKmh: 2,
  },
  planned: null,
  recent: [],
}

for (const [name, input] of [["RUN WITH PLAN", run], ["UNPLANNED SWIM", swim]] as const) {
  console.log(`\n=== ${name} ===`)
  console.log(buildInsightPrompt(buildFacts(input)))
}