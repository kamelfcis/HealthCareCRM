import { Router } from "express";
import { z } from "zod";
import { appointmentController } from "../controllers/appointment.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermissions } from "../middleware/rbac.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

const createSchema = z.object({
  body: z.object({
    doctorId: z.string().min(1),
    patientId: z.string().min(1),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    reason: z.string().optional(),
    notes: z.string().optional(),
    status: z
      .enum(["SCHEDULED", "CHECKED_IN", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"])
      .optional()
  })
});

router.get("/", requireAuth, requirePermissions("appointments.read"), asyncHandler(appointmentController.list));
router.post(
  "/",
  requireAuth,
  requirePermissions("appointments.manage"),
  validate(createSchema),
  asyncHandler(appointmentController.create)
);
router.patch(
  "/:id",
  requireAuth,
  requirePermissions("appointments.manage"),
  asyncHandler(appointmentController.update)
);
router.delete(
  "/:id",
  requireAuth,
  requirePermissions("appointments.manage"),
  asyncHandler(appointmentController.remove)
);

export default router;
