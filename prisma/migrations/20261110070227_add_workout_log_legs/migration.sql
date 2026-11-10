-- CreateTable
CREATE TABLE "WorkoutLogLeg" (
    "id" TEXT NOT NULL,
    "logId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "discipline" "Discipline" NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "distanceKm" DOUBLE PRECISION,
    "avgHeartRate" INTEGER,
    "avgPaceSecKm" INTEGER,
    "avgSpeedKmh" DOUBLE PRECISION,

    CONSTRAINT "WorkoutLogLeg_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkoutLogLeg_logId_order_idx" ON "WorkoutLogLeg"("logId", "order");

-- AddForeignKey
ALTER TABLE "WorkoutLogLeg" ADD CONSTRAINT "WorkoutLogLeg_logId_fkey" FOREIGN KEY ("logId") REFERENCES "WorkoutLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
