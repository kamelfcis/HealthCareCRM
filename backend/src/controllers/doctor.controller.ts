import { Response } from "express";
import { doctorService } from "../services/doctor.service";
import { getPagination } from "../utils/http";
import { apiSuccess } from "../utils/api-response";
import { AuthenticatedRequest } from "../types/auth";
import { getOptionalClinicScope, getScopedClinicId } from "../utils/tenant";
import { buildCacheKey, getOrSetCache, invalidateCacheByPrefix } from "../utils/response-cache";

export const doctorController = {
  async list(req: AuthenticatedRequest, res: Response) {
    const { page, pageSize, search } = getPagination(req);
    const clinicId = getOptionalClinicScope(req);
    const specialty = typeof req.query.specialty === "string" ? req.query.specialty : undefined;
    const cachePrefix = buildCacheKey("doctors", clinicId ?? "all");
    const data = await getOrSetCache(
      buildCacheKey(cachePrefix, "list", page, pageSize, search ?? "", specialty ?? ""),
      45_000,
      () =>
        doctorService.list({
          clinicId,
          page,
          pageSize,
          search,
          specialty
        })
    );
    res.json(apiSuccess(data));
  },

  async create(req: AuthenticatedRequest, res: Response) {
    const clinicId = getScopedClinicId(req);
    const data = await doctorService.create(clinicId, req.body);
    invalidateCacheByPrefix(buildCacheKey("doctors", clinicId));
    invalidateCacheByPrefix(buildCacheKey("dashboard", clinicId));
    res.status(201).json(apiSuccess(data, "Doctor created"));
  },

  async update(req: AuthenticatedRequest, res: Response) {
    const clinicId = getScopedClinicId(req);
    const data = await doctorService.update(String(req.params.id), clinicId, req.body);
    invalidateCacheByPrefix(buildCacheKey("doctors", clinicId));
    invalidateCacheByPrefix(buildCacheKey("dashboard", clinicId));
    res.json(apiSuccess(data, "Doctor updated"));
  },

  async remove(req: AuthenticatedRequest, res: Response) {
    const clinicId = getScopedClinicId(req);
    const data = await doctorService.remove(String(req.params.id), clinicId);
    invalidateCacheByPrefix(buildCacheKey("doctors", clinicId));
    invalidateCacheByPrefix(buildCacheKey("dashboard", clinicId));
    res.json(apiSuccess(data, "Doctor deleted"));
  }
};
