import { buildMonthlyFacts, type MonthLog, type MonthlyInput } from "../src/lib/monthly-facts"

const today = new Date(Date.UTC(2026, 10, 18)) // 18 Nov: the comparison period is 14 to 31 Oct

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

function log(month: number, day: number, discipline: MonthLog["discipline"], minutes: number, km: number | null): MonthLog {
  return { date: new Date(Date.UTC(2026, month, day)), discipline, durationMin: minutes, distanceKm: km }
}

const logs: MonthLog[] = [
  // This month
  log(10, 2, "RUN", 30, 5),
  log(10, 9, "RUN", 30, 5),
  log(10, 5, "SWIM", 40, 1.5),
  log(10, 7, "BIKE", 60, 25),
  log(10, 12, "BIKE", 60, 30),
  // The comparison period
  log(9, 20, "RUN", 30, 4.5),
  log(9, 27, "RUN", 30, 4.5),
  log(9, 18, "BIKE", 60, 24),
  log(9, 25, "BIKE", 60, 24),
  // Just before the comparison period: must be ignored
  log(9, 13, "RUN", 100, 15),
]

function build(overrides: Partial<MonthlyInput> = {}) {
  return buildMonthlyFacts({ today, logs, adherence: null, brickComparison: null, ...overrides })
}

const text = (facts: string[] | null) => (facts ?? []).join("\n")

const full = build()
check("counts this month's sessions", full.sessions === 5 && full.facts !== null, full)
check(
  "run pace is compared and faster",
  /Run pace: 6:00 per km over 2 runs, compared with 6:40 per km over 2 runs.*faster/.test(text(full.facts)),
  full.facts
)
check(
  "bike speed is compared and faster",
  /Bike speed: 27.5 km\/h over 2 rides.*24 km\/h.*faster/.test(text(full.facts)),
  full.facts
)
check(
  "the comparison period has the same length and ignores older logs",
  text(full.facts).includes("220 minutes") &&
    text(full.facts).includes("180 minutes") &&
    !text(full.facts).includes("280"),
  full.facts
)
check("no swim pace with only one swim", !text(full.facts).includes("Swim pace"), full.facts)

check("fewer than 4 sessions gives no facts", build({ logs: logs.slice(0, 3) }).facts === null)

check(
  "plan adherence is worked out in code",
  text(build({ adherence: { done: 3, due: 4 } }).facts).includes("(75%)")
)
check("no adherence line without a plan", !text(full.facts).includes("Planned workouts"))

check(
  "the brick comparison is included when it exists",
  text(
    build({ brickComparison: { brickPaceSecKm: 380, standalonePaceSecKm: 360, differenceSec: 20 } }).facts
  ).includes("20 seconds per km slower after the bike")
)
check("a missing brick comparison is stated", text(full.facts).includes("not enough brick data"))

console.log(`\n${total - failed} of ${total} checks passed`)
if (failed > 0) process.exitCode = 1