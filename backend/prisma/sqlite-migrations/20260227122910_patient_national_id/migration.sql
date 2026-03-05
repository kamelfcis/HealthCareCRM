-- AlterTable
ALTER TABLE "Patient" ADD COLUMN "nationalId" TEXT;

-- CreateIndex
CREATE INDEX "Patient_clinicId_nationalId_idx" ON "Patient"("clinicId", "nationalId");
