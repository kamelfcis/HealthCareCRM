import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermissions } from "../middleware/rbac.middleware";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.get("/metrics", requireAuth, requirePermissions("dashboard.view"), asyncHandler(dashboardController.metrics));

export default router;
