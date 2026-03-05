import { Router } from "express";
import { z } from "zod";
import { billingController } from "../controllers/billing.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermissions } from "../middleware/rbac.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

const createSchema = z.object({
  body: z.object({
    patientId: z.string().min(1),
    invoiceNumber: z.string().min(2),
    amount: z.number().positive(),
    dueDate: z.string().optional(),
    notes: z.string().optional()
  })
});

router.get("/", requireAuth, requirePermissions("billing.read"), asyncHandler(billingController.list));
router.post(
  "/",
  requireAuth,
  requirePermissions("billing.manage"),
  validate(createSchema),
  asyncHandler(billingController.create)
);
router.patch(
  "/:id",
  requireAuth,
  requirePermissions("billing.manage"),
  asyncHandler(billingController.update)
);
router.delete("/:id", requireAuth, requirePermissions("billing.manage"), asyncHandler(billingController.remove));

export default router;
