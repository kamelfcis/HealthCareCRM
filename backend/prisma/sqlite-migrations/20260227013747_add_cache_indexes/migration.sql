-- CreateIndex
CREATE INDEX "Appointment_clinicId_deletedAt_createdAt_idx" ON "Appointment"("clinicId", "deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "Clinic_deletedAt_createdAt_idx" ON "Clinic"("deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "Doctor_clinicId_deletedAt_createdAt_idx" ON "Doctor"("clinicId", "deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "Invoice_clinicId_deletedAt_createdAt_idx" ON "Invoice"("clinicId", "deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "Patient_clinicId_deletedAt_createdAt_idx" ON "Patient"("clinicId", "deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_clinicId_deletedAt_createdAt_idx" ON "Payment"("clinicId", "deletedAt", "createdAt");
