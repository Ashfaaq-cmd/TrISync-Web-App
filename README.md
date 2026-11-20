# TriSync

TriSync is a full-stack triathlon training web app for planning workouts, logging completed sessions and reviewing training progress across swimming, cycling and running.

## Features

- Athlete onboarding and profile management
- AI-assisted triathlon training plans
- Weekly training-plan navigation
- Swim, bike, run and strength workout logging
- Workout analysis and performance insights
- Training-learning hub with searchable resources
- Dashboard summaries and progress tracking
- Email/password and Google authentication
- Profile avatars stored with Vercel Blob
- PostgreSQL persistence through Prisma and Neon
- Gmail-only account registration and sign-in

## Tech Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Auth.js / NextAuth v5
- Prisma 7
- PostgreSQL / Neon
- Google Gemini API
- Vercel Blob
- Zod
- ESLint

## Prerequisites

- Node.js 20.9 or newer
- npm
- A PostgreSQL database, such as Neon
- A Google OAuth application for Google sign-in
- A Gemini API key for AI-generated plans and insights
- A Vercel Blob store for profile images

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root.

3. Add the required environment variables:

   ```dotenv
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."

   AUTH_SECRET="a-long-random-secret"
   AUTH_GOOGLE_ID="..."
   AUTH_GOOGLE_SECRET="..."

   GEMINI_API_KEY="..."
   AI_MODEL="..."
   AI_FALLBACK_MODEL="..."

   BLOB_READ_WRITE_TOKEN="..."
   YOUTUBE_API_KEY="..."
   ```

   `DATABASE_URL` is used by the application, while `DIRECT_URL` is used by Prisma configuration. The YouTube key is optional unless using YouTube video-seeding scripts.

4. Generate the Prisma client:

   ```bash
   npx prisma generate
   ```

5. Apply database migrations:

   ```bash
   npx prisma migrate deploy
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000).

## Database

The Prisma schema is in `prisma/schema.prisma`, and its configuration is in `prisma.config.ts`.

Seed the learning-hub lessons:

```bash
npm run db:seed
```

Seed YouTube learning resources:

```bash
npm run db:seed-videos
```

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:seed` | Seed learning-hub content |
| `npm run db:seed-videos` | Search and seed YouTube resources |
| `npm run yt:search` | Search YouTube videos |
| `npm run ai:test` | Run a basic AI integration check |
| `npm run ai:test-full` | Run the full AI integration check |
| `npm run ai:models` | List available Gemini models |
| `npm run test:plan-rules` | Test plan validation rules |
| `npm run ai:test-plan` | Test AI plan generation |
| `npm run test:plan-repair` | Test plan repair behavior |
| `npm run ai:insight-facts` | Test insight fact generation |
| `npm run test:analysis` | Test training analysis |
| `npm run test:monthly-facts` | Test monthly facts |
| `npm run test:avatar` | Test avatar processing |
| `npm run eval:plans` | Run training-plan evaluations |
| `npm run eval:summary` | Summarize evaluation results |

## Authentication

TriSync restricts password registration and login, plus Google sign-in, to Gmail addresses.

Password sessions use a JWT session strategy. Configure Google OAuth with the application's callback URL for the environment in which it runs.

For local development, Auth.js typically uses:

```text
http://localhost:3000/api/auth/callback/google
```

## Project Structure

```text
src/
  app/          App Router pages and route handlers
  components/   Reusable UI components
  lib/          Business logic, AI, database and validation modules
prisma/
  schema.prisma Prisma database schema
  seed.ts       Learning-hub seed data
scripts/        AI, database and evaluation utilities
evaluation/     Plan scenarios and evaluation results
public/         Static assets
```

## Production Build

```bash
npm run lint
npm run build
npm run start
```

The production environment must provide the database, Auth.js, Gemini, YouTube and Blob variables required by the features being used.
