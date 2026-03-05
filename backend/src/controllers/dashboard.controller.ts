import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import { apiSuccess } from "../utils/api-response";
import { getOptionalClinicScope } from "../utils/tenant";
import { dashboardService } from "../services/dashboard.service";
import { buildCacheKey, getOrSetCache } from "../utils/response-cache";

export const dashboardController = {
  async metrics(req: AuthenticatedRequest, res: Response) {
    const clinicId = getOptionalClinicScope(req);
    const cacheKey = buildCacheKey("dashboard", clinicId ?? "all", "metrics");
    const data = await getOrSetCache(cacheKey, 25_000, () => dashboardService.metrics(clinicId));
    res.json(apiSuccess(data));
  }
};
