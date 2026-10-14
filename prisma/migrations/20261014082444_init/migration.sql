-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "RaceGoal" AS ENUM ('SPRINT', 'OLYMPIC', 'HALF_IRONMAN', 'IRONMAN', 'GENERAL_FITNESS');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Discipline" AS ENUM ('SWIM', 'BIKE', 'RUN', 'BRICK', 'STRENGTH', 'REST');

-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM ('QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES', 'CORE', 'SHOULDERS', 'BACK', 'CHEST', 'ARMS', 'HIP_FLEXORS');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('COACH_LESSON', 'YOUTUBE_VIDEO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "hashedPassword" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "experienceLevel" "ExperienceLevel" NOT NULL,
    "goal" "RaceGoal" NOT NULL,
    "daysPerWeek" INTEGER NOT NULL,
    "minutesPerSession" INTEGER,
    "targetRaceDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "goal" "RaceGoal" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalWeeks" INTEGER NOT NULL,
    "aiRawOutput" JSONB,
    "aiModel" TEXT,
    "aiPromptVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "discipline" "Discipline" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "muscleGroups" "MuscleGroup"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSegment" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "discipline" "Discipline" NOT NULL,
    "targetDistanceKm" DOUBLE PRECISION,
    "targetDurationMin" INTEGER,
    "targetIntensity" TEXT,

    CONSTRAINT "WorkoutSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutId" TEXT,
    "discipline" "Discipline" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "distanceKm" DOUBLE PRECISION,
    "durationMin" INTEGER,
    "avgPaceSecKm" INTEGER,
    "avgHeartRate" INTEGER,
    "avgSpeedKmh" DOUBLE PRECISION,
    "notes" TEXT,
    "aiInsight" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerformanceInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningResource" (
    "id" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "youtubeVideoId" TEXT,
    "coverImageUrl" TEXT,
    "discipline" "Discipline",
    "muscleGroups" "MuscleGroup"[],
    "topicTags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutResource" (
    "workoutId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,

    CONSTRAINT "WorkoutResource_pkey" PRIMARY KEY ("workoutId","resourceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "WorkoutSegment_workoutId_order_idx" ON "WorkoutSegment"("workoutId", "order");

-- CreateIndex
CREATE INDEX "PerformanceInsight_userId_periodStart_periodEnd_idx" ON "PerformanceInsight"("userId", "periodStart", "periodEnd");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlan" ADD CONSTRAINT "TrainingPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TrainingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSegment" ADD CONSTRAINT "WorkoutSegment_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceInsight" ADD CONSTRAINT "PerformanceInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutResource" ADD CONSTRAINT "WorkoutResource_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutResource" ADD CONSTRAINT "WorkoutResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "LearningResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
