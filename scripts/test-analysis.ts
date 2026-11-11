import { buildAnalysis, type AnalysisLog } from "../src/lib/analysis"

const now = new Date(Date.UTC(2026, 10, 18)) // a Wednesday

let total = 0
let failed = 0

function check(name: string, passed: boolean, details?: unknown) {
  total += 1
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}`)
  if (!passed) {
    failed += 1
    console.log("      details:", details)
  }
}

function log(overrides: Partial<AnalysisLog>): AnalysisLog {
  return {
    date: new Date(Date.UTC(2026, 10, 10)),
    discipline: "RUN",
    durationMin: 30,
    distanceKm: 5,
    avgHeartRate: null,
    avgPaceSecKm: 360,
    avgSpeedKmh: 10,
    legs: [],
    ...overrides,
  }
}

function brick(durationMin: number, distanceKm: number | null, avgHeartRate: number | null) {
  return log({
    discipline: "BRICK",
    durationMin: 60,
    legs: [
      { discipline: "BIKE", durationMin: 45, distanceKm: 20, avgHeartRate: null },
      { discipline: "RUN", durationMin, distanceKm, avgHeartRate },
    ],
  })
}

// Pooled pace: 10 km in 50 min and 5 km in 30 min is 4800 s over 15 km = 320 s/km,
// not the 330 s/km you get from averaging the two paces
const runs = [
  log({ durationMin: 50, distanceKm: 10 }),
  log({ durationMin: 30, distanceKm: 5 }),
  log({ durationMin: 33, distanceKm: 6 }),
]
const bricks = [brick(15, 2.5, 160), brick(15, 2.5, 160), brick(15, 2.5, 160)]

const full = buildAnalysis([...runs, ...bricks], now)
check(
  "brick comparison uses pooled pace",
  full.brick.comparison?.standalonePaceSecKm === Math.round((3000 + 1800 + 1980) / 21) &&
    full.brick.comparison?.brickPaceSecKm === 360,
  full.brick.comparison
)
check(
  "difference is positive when the brick run is slower",
  (full.brick.comparison?.differenceSec ?? 0) > 0,
  full.brick.comparison
)
check(
  "heart rate is only compared when both groups have it",
  full.brick.comparison?.brickHeartRate === 160 &&
    full.brick.comparison?.standaloneHeartRate === null,
  full.brick.comparison
)

const twoBricks = buildAnalysis([...runs, ...bricks.slice(0, 2)], now)
check(
  "fewer than 3 brick run legs gives no comparison",
  twoBricks.brick.comparison === null && twoBricks.brick.brickRunLegs === 2,
  twoBricks.brick
)

const noDistance = buildAnalysis(
  [...runs, brick(15, null, 160), brick(15, null, 160), brick(15, null, 160)],
  now
)
check(
  "run legs without a distance are not counted",
  noDistance.brick.comparison === null && noDistance.brick.brickRunLegs === 0,
  noDistance.brick
)

const oldBricks = buildAnalysis(
  [...runs, log({ discipline: "BRICK", durationMin: 60, distanceKm: 22 })],
  now
)
check(
  "a brick without legs is ignored",
  oldBricks.brick.brickRunLegs === 0,
  oldBricks.brick
)

const swim = buildAnalysis([log({ discipline: "SWIM", avgPaceSecKm: 1800, avgSpeedKmh: 2 })], now)
check("swim pace is per 100 m", swim.swim[0]?.value === 180, swim.swim)
check("a swim is not counted as a run", swim.run.length === 0, swim.run)

const ride = buildAnalysis([log({ discipline: "BIKE", avgSpeedKmh: 27.5 })], now)
check("bike points use speed", ride.bike[0]?.value === 27.5, ride.bike)

check("volume covers 12 weeks", full.volume.length === 12, full.volume.length)

console.log(`\n${total - failed} of ${total} checks passed`)
if (failed > 0) process.exitCode = 1