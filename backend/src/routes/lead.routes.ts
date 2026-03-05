import { Router } from "express";
import { z } from "zod";
import { leadController } from "../controllers/lead.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermissions } from "../middleware/rbac.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

const createLeadSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(3),
    whatsapp: z.string().optional(),
    leadSource: z.enum(["FACEBOOK_AD", "GOOGLE_SEARCH", "DOCTOR_REFERRAL", "FRIEND"]),
    notes: z.string().optional(),
    assignedToId: z.string().optional()
  })
});

const updateLeadSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().min(3).optional(),
    whatsapp: z.string().optional(),
    leadSource: z.enum(["FACEBOOK_AD", "GOOGLE_SEARCH", "DOCTOR_REFERRAL", "FRIEND"]).optional(),
    notes: z.string().optional(),
    assignedToId: z.string().optional()
  })
});

const statusSchema = z.object({
  body: z.object({
    status: z.enum(["NEW", "CONTACTED", "FOLLOW_UP", "CONVERTED", "LOST"])
  })
});

const followUpSchema = z.object({
  body: z.object({
    note: z.string().min(1),
    followUpDate: z.string().min(1),
    status: z.enum(["NEW", "CONTACTED", "FOLLOW_UP", "CONVERTED", "LOST"])
  })
});

const convertSchema = z.object({
  body: z
    .object({
      profession: z.enum(["ADMIN_EMPLOYEE", "FREELANCER", "DRIVER", "ENGINEER", "FACTORY_WORKER", "OTHER"]),
      professionOther: z.string().optional(),
      dateOfBirth: z.string().optional(),
      address: z.string().optional()
    })
    .superRefine((value, ctx) => {
      if (value.profession === "OTHER" && !value.professionOther?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["professionOther"],
          message: "professionOther is required when profession is OTHER"
        });
      }
    })
});

router.get("/", requireAuth, requirePermissions("leads.read"), asyncHandler(leadController.list));
router.get("/:id", requireAuth, requirePermissions("leads.read"), asyncHandler(leadController.getById));
router.post(
  "/",
  requireAuth,
  requirePermissions("leads.manage"),
  validate(createLeadSchema),
  asyncHandler(leadController.create)
);
router.patch(
  "/:id",
  requireAuth,
  requirePermissions("leads.manage"),
  validate(updateLeadSchema),
  asyncHandler(leadController.update)
);
router.patch(
  "/:id/status",
  requireAuth,
  requirePermissions("leads.manage"),
  validate(statusSchema),
  asyncHandler(leadController.changeStatus)
);
router.post(
  "/:id/followups",
  requireAuth,
  requirePermissions("leads.manage"),
  validate(followUpSchema),
  asyncHandler(leadController.addFollowUp)
);
router.post(
  "/:id/convert",
  requireAuth,
  requirePermissions("leads.convert"),
  validate(convertSchema),
  asyncHandler(leadController.convert)
);

export default router;
