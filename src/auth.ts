import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import Google from "next-auth/providers/google"

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Credentials login only works with JWT sessions
  session: { strategy: "jwt" },
  pages:{ signIn: "/login" },
  providers: [
    Google,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        // Check the input is valid before touching the database
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        })

        // Google-only accounts have no password, so they can't log in here
        if (!user?.hashedPassword) return null

        const passwordMatches = await bcrypt.compare(
          parsed.data.password,
          user.hashedPassword
        )
        if (!passwordMatches) return null

        return { id: user.id, name: user.name, email: user.email }
      },
    }),
  ],
  callbacks: {
    // Make the user's id available on session.user
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    },
  },
})