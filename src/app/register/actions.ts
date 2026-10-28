"use server"

import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { gmailEmailSchema } from "@/lib/validations/email"

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: gmailEmailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type RegisterState = { error?: string } | undefined

export async function registerUser(
  _previousState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  // Validate on the server even though the form also checks in the browser
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { name, password } = parsed.data
  const email = parsed.data.email.toLowerCase()

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: "An account with this email already exists" }
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  await prisma.user.create({ data: { name, email, hashedPassword } })
}