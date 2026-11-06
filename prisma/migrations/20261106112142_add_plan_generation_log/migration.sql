-- CreateEnum
CREATE TYPE "GenerationOutcome" AS ENUM ('SUCCESS', 'RULES_FAILED', 'UNAVAILABLE');

-- CreateTable
CREATE TABLE "PlanGenerationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "outcome" "GenerationOutcome" NOT NULL,
    "attempts" INTEGER NOT NULL,
    "repairs" INTEGER NOT NULL DEFAULT 0,
    "aiModel" TEXT,
    "promptVersion" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "problems" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanGenerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanGenerationLog_userId_createdAt_idx" ON "PlanGenerationLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "PlanGenerationLog" ADD CONSTRAINT "PlanGenerationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
