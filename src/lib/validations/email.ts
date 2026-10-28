import { z } from "zod"

export const gmailEmailSchema = z
  .email("Use a valid @gmail.com address")
  .refine((email) => email.toLowerCase().endsWith("@gmail.com"), {
    message: "Use an @gmail.com address",
  })
