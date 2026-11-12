/*
  Warnings:

  - A unique constraint covering the columns `[userId,periodStart]` on the table `PerformanceInsight` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PerformanceInsight" ADD COLUMN     "aiModel" TEXT,
ADD COLUMN     "facts" JSONB,
ADD COLUMN     "headline" TEXT,
ADD COLUMN     "lastAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "promptVersion" TEXT,
ADD COLUMN     "suggestion" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "summary" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceInsight_userId_periodStart_key" ON "PerformanceInsight"("userId", "periodStart");
