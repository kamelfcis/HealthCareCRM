import { Router } from "express";
import { z } from "zod";
import { medicalRecordController } from "../controllers/medical-record.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermissions } from "../middleware/rbac.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

const createSchema = z.object({
  body: z.object({
    patientId: z.string().min(1),
    diagnosis: z.string().min(2),
    treatment: z.string().optional(),
    notes: z.string().optional()
  })
});

router.get("/", requireAuth, requirePermissions("medical_records.read"), asyncHandler(medicalRecordController.list));
router.post(
  "/",
  requireAuth,
  requirePermissions("medical_records.manage"),
  validate(createSchema),
  asyncHandler(medicalRecordController.create)
);
router.patch(
  "/:id",
  requireAuth,
  requirePermissions("medical_records.manage"),
  asyncHandler(medicalRecordController.update)
);
router.delete(
  "/:id",
  requireAuth,
  requirePermissions("medical_records.manage"),
  asyncHandler(medicalRecordController.remove)
);

export default router;
