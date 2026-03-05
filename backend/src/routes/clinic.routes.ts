import { Router } from "express";
import { z } from "zod";
import { clinicController } from "../controllers/clinic.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { allowRoles } from "../middleware/rbac.middleware";
import { uploadClinicImage } from "../middleware/upload.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

const createSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    timezone: z.string().optional(),
    specialtyCodes: z.array(z.string().min(1)).min(1).optional()
  })
});

const updateMeSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    timezone: z.string().optional(),
    specialtyCodes: z.array(z.string().min(1)).min(1).optional()
  })
});

router.get("/me", requireAuth, allowRoles("ClinicAdmin"), asyncHandler(clinicController.me));
router.patch(
  "/me",
  requireAuth,
  allowRoles("ClinicAdmin"),
  uploadClinicImage.single("clinicImage"),
  validate(updateMeSchema),
  asyncHandler(clinicController.updateMe)
);

router.get("/", requireAuth, allowRoles("SuperAdmin"), asyncHandler(clinicController.list));
router.post(
  "/",
  requireAuth,
  allowRoles("SuperAdmin"),
  validate(createSchema),
  asyncHandler(clinicController.create)
);
router.patch("/:id", requireAuth, allowRoles("SuperAdmin"), asyncHandler(clinicController.update));
router.delete("/:id", requireAuth, allowRoles("SuperAdmin"), asyncHandler(clinicController.remove));

export default router;
