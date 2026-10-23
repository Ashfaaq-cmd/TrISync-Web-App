import { date, z } from "zod"

export const LOG_DISCIPLINES = ["SWIM", "BIKE", "RUN", "BRICK", "STRENGTH"] as const

export const logDisciplineSchema = z.enum(LOG_DISCIPLINES, "Choose a Discipline")

const MS_PER_DAY = 24 * 60 *60 *1000

export const workoutLogSchema = z.object({
    date: z.coerce
    .date("Choose the date of the session")
    // 1 day tolerance: local & utc dates can diifer
    .refine((date)=> date.getTime()<= Date.now() + MS_PER_DAY, "The date cannot be in the future"),
     durationMin: z.coerce
    .number("Enter the duration in minutes")
    .int("Duration must be a whole number of minutes")
    .min(1, "Duration must be at least 1 minute")
    .max(1440, "Duration cannot be more than 24 hours"),
  distanceKm: z.coerce
    .number("Distance must be a number")
    .positive("Distance must be greater than zero")
    .max(1000, "Distance looks too large")
    .optional(),
  avgHeartRate: z.coerce
    .number("Heart rate must be a number")
    .int("Heart rate must be a whole number")
    .min(30, "Heart rate looks too low")
    .max(250, "Heart rate looks too high")
    .optional(),
  notes: z.string().trim().max(2000, "Notes can be at most 2000 characters").optional(),
})

 