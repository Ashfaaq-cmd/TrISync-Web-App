import { z } from "zod"

export const LOG_DISCIPLINES = ["SWIM", "BIKE", "RUN", "BRICK", "STRENGTH"] as const

export const logDisciplineSchema = z.enum(LOG_DISCIPLINES, "Choose a discipline")

// A brick that is not in the plan has these two legs
export const DEFAULT_BRICK_LEGS = ["BIKE", "RUN"] as const
export const MAX_LEGS = 4

const MS_PER_DAY = 24 * 60 * 60 * 1000
const MAX_DISTANCE_KM = 1000

const sessionSchema = z.object({
  date: z.coerce
    .date("Choose the date of the session")
    // One day of tolerance, because local and UTC dates can differ
    .refine(
      (date) => date.getTime() <= Date.now() + MS_PER_DAY,
      "The date cannot be in the future"
    ),
  notes: z.string().trim().max(2000, "Notes can be at most 2000 characters").optional(),
})

const measuresSchema = z.object({
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
})

export type Measures = {
  durationMin: number
  distanceKm?: number
  avgHeartRate?: number
}

export function parseSession(
  formData: FormData
): { data: z.infer<typeof sessionSchema> } | { error: string } {
  const parsed = sessionSchema.safeParse({
    date: formData.get("date") || undefined,
    notes: formData.get("notes") || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  return { data: parsed.data }
}

// Reads duration, distance and heart rate. The prefix is "" for a normal
// session, or "leg0_", "leg1_"... for the legs of a brick.
export function parseMeasures(
  formData: FormData,
  prefix = "",
  label = ""
): { data: Measures } | { error: string } {
  const tag = label ? `${label}: ` : ""

  const parsed = measuresSchema.safeParse({
    durationMin: formData.get(`${prefix}durationMin`) || undefined,
    distance: formData.get(`${prefix}distance`) || undefined,
    distanceUnit: formData.get(`${prefix}distanceUnit`) || undefined,
    avgHeartRate: formData.get(`${prefix}avgHeartRate`) || undefined,
  })
  if (!parsed.success) return { error: `${tag}${parsed.error.issues[0].message}` }

  const { distance, distanceUnit, durationMin, avgHeartRate } = parsed.data

  let distanceKm: number | undefined
  if (distance !== undefined) {
    // Stored to the nearest metre
    distanceKm = Math.round((distanceUnit === "m" ? distance / 1000 : distance) * 1000) / 1000
    if (distanceKm <= 0) return { error: `${tag}Distance is too small` }
    if (distanceKm > MAX_DISTANCE_KM) {
      return { error: `${tag}Distance looks too large. Check the unit (km or m).` }
    }
  }

  return { data: { durationMin, distanceKm, avgHeartRate } }
}