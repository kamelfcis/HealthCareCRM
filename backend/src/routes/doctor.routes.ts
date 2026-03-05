import { Router } from "express";
import { z } from "zod";
import { doctorController } from "../controllers/doctor.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermissions } from "../middleware/rbac.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

const createSchema = z.object({
  body: z.object({
    userId: z.string().min(1),
    licenseNumber: z.string().min(3),
    specialty: z.string().min(2)
  })
});

router.get("/", requireAuth, requirePermissions("doctors.read"), asyncHandler(doctorController.list));
router.post(
  "/",
  requireAuth,
  requirePermissions("doctors.manage"),
  validate(createSchema),
  asyncHandler(doctorController.create)
);
router.patch("/:id", requireAuth, requirePermissions("doctors.manage"), asyncHandler(doctorController.update));
router.delete(
  "/:id",
  requireAuth,
  requirePermissions("doctors.manage"),
  asyncHandler(doctorController.remove)
);

export default router;
