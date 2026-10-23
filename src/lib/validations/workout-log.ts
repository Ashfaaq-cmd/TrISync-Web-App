import { z } from "zod"

export const LOG_DISCIPLINES = ["SWIM", "BIKE", "RUN", "BRICK", "STRENGTH"] as const

export const logDisciplineSchema = z.enum(LOG_DISCIPLINES, "Choose a discipline")

const MS_PER_DAY = 24 * 60 * 60 * 1000
const MAX_DISTANCE_KM = 1000

const workoutLogSchema = z.object({
  date: z.coerce
    .date("Choose the date of the session")
    // One day of tolerance, because local and UTC dates can differ
    .refine(
      (date) => date.getTime() <= Date.now() + MS_PER_DAY,
      "The date cannot be in the future"
    ),
  durationMin: z.coerce
    .number("Enter the duration in minutes")
    .int("Duration must be a whole number of minutes")
    .min(1, "Duration must be at least 1 minute")
    .max(1440, "Duration cannot be more than 24 hours"),
  distance: z.coerce
    .number("Distance must be a number")
    .positive("Distance must be greater than zero")
    .optional(),
  distanceUnit: z.enum(["km", "m"]).default("km"),
  avgHeartRate: z.coerce
    .number("Heart rate must be a number")
    .int("Heart rate must be a whole number")
    .min(30, "Heart rate looks too low")
    .max(250, "Heart rate looks too high")
    .optional(),
  notes: z.string().trim().max(2000, "Notes can be at most 2000 characters").optional(),
})

// Read and check the fields shared by "log" and "edit", and turn distance into km
export function parseLogFields(formData: FormData) {
  const parsed = workoutLogSchema.safeParse({
    date: formData.get("date") || undefined,
    durationMin: formData.get("durationMin") || undefined,
    distance: formData.get("distance") || undefined,
    distanceUnit: formData.get("distanceUnit") || undefined,
    avgHeartRate: formData.get("avgHeartRate") || undefined,
    notes: formData.get("notes") || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { distance, distanceUnit, ...rest } = parsed.data

  let distanceKm: number | undefined
  if (distance !== undefined) {
    // Stored to the nearest metre
    distanceKm = Math.round((distanceUnit === "m" ? distance / 1000 : distance) * 1000) / 1000
    if (distanceKm <= 0) return { error: "Distance is too small" }
    if (distanceKm > MAX_DISTANCE_KM) {
      return { error: "Distance looks too large. Check the unit (km or m)." }
    }
  }

  return { data: { ...rest, distanceKm } }
}