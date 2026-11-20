import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { categorise } from "./eval-categories"
import type { RunRecord } from "./eval-types"

const files = process.argv.slice(2)

function load() {
  return files.flatMap((file) =>
    readFileSync(file, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as RunRecord)
  )
}

const mean = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null

function median(values: number[]) {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

const round1 = (value: number | null) => (value === null ? null : Math.round(value * 10) / 10)
const fraction = (k: number, n: number) =>
  n === 0 ? "n/a" : `${k}/${n} (${Math.round((k / n) * 100)}%)`
const rate = (k: number, n: number) => (n === 0 ? null : Math.round((k / n) * 1000) / 10)

function compute(records: RunRecord[]) {
  // A run is "completed" when the AI answered and the rules decided the outcome
  const completed = records.filter((r) => r.outcome === "SUCCESS" || r.outcome === "RULES_FAILED")
  const successes = completed.filter((r) => r.outcome === "SUCCESS")
  const clean = successes.filter((r) => r.attempts === 1 && r.repairs === 0)
  const otherModel = successes.filter((r) => r.model && r.primaryModel && r.model !== r.primaryModel)

  const categories = new Map<string, number>()
  for (const record of records) {
    for (const attempt of record.rejected) {
      for (const category of new Set(attempt.problems.map(categorise))) {
        categories.set(category, (categories.get(category) ?? 0) + 1)
      }
    }
  }
  const topProblems = [...categories]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => `${name} (${count})`)
    .join(", ")

  return {
    runs: records.length,
    notCompleted: records.length - completed.length,
    completed: completed.length,
    successes: successes.length,
    clean: clean.length,
    meanAttempts: round1(mean(successes.map((r) => r.attempts))),
    meanRepairs: round1(mean(successes.map((r) => r.repairs))),
    medianSeconds: round1(median(completed.map((r) => r.durationSec))),
    otherModel: otherModel.length,
    topProblems,
  }
}

function csvCell(value: string | number | null) {
  const text = value === null ? "" : String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function main() {
  if (files.length === 0) {
    throw new Error("Usage: npm run eval:summary -- <results file> [more files]")
  }

  const records = load()
  const groups = new Map<string, RunRecord[]>()
  for (const record of records) {
    const key = `${record.promptVersion}${record.label ? ` (${record.label})` : ""}`
    groups.set(key, [...(groups.get(key) ?? []), record])
  }

  const csv: (string | number | null)[][] = [
    [
      "group", "scenario", "runs", "not_completed", "completed", "successes",
      "success_rate_pct", "clean_passes", "clean_rate_pct", "mean_attempts",
      "mean_repairs", "median_seconds", "accepted_from_other_model", "top_problems",
    ],
  ]

  for (const [group, groupRecords] of groups) {
    const scenarioIds = [...new Set(groupRecords.map((r) => r.scenarioId))]
    const table: Record<string, string | number | null>[] = []

    for (const scenario of [...scenarioIds, "ALL"]) {
      const subset =
        scenario === "ALL" ? groupRecords : groupRecords.filter((r) => r.scenarioId === scenario)
      const s = compute(subset)

      table.push({
        scenario,
        runs: s.runs,
        "not completed": s.notCompleted,
        success: fraction(s.successes, s.completed),
        "clean pass": fraction(s.clean, s.completed),
        "mean attempts": s.meanAttempts,
        "mean repairs": s.meanRepairs,
        "median s": s.medianSeconds,
        "other model": `${s.otherModel}/${s.successes}`,
        "top problems": s.topProblems,
      })

      csv.push([
        group, scenario, s.runs, s.notCompleted, s.completed, s.successes,
        rate(s.successes, s.completed), s.clean, rate(s.clean, s.completed),
        s.meanAttempts, s.meanRepairs, s.medianSeconds, s.otherModel, s.topProblems,
      ])
    }

    console.log(`\nPrompt ${group}`)
    console.table(table)
  }

  mkdirSync("evaluation", { recursive: true })
  writeFileSync(
    "evaluation/summary.csv",
    csv.map((row) => row.map(csvCell).join(",")).join("\n")
  )
  console.log("\nSaved evaluation/summary.csv")
  console.log(
    "Small samples: treat these figures as indicative. Note the time of day and the model for every run set."
  )
}

main()