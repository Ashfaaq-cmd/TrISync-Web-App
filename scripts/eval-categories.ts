// Order matters: the first pattern that matches wins
const CATEGORIES: [RegExp, string][] = [
  [/not valid JSON/i, "Invalid JSON"],
  [/must be \d+ weeks long|exactly one workout for each day/i, "Incomplete plan"],
  [/unwell/i, "Unwell rule"],
  [/minute limit/i, "Session too long"],
  [/above week/i, "Progression too fast"],
  [/No recovery week/i, "Missing recovery week"],
  [/final week|taper/i, "Taper"],
  [/training days/i, "Training days"],
  [/hard session|hard workouts|in a row/i, "Hard sessions"],
  [/brick session/i, "Early brick (beginner)"],
  [/no (swim|bike|run) session/i, "Missing discipline"],
  [/explanation|muscle group|intensity|duration/i, "Missing detail"],
]

export function categorise(problem: string) {
  for (const [pattern, name] of CATEGORIES) {
    if (pattern.test(problem)) return name
  }
  // Schema errors look like "workouts.94.segments.0.targetDistanceKm: Too small..."
  if (/^[\w.\[\]]*: /.test(problem)) return "Schema error"
  return "Other"
}