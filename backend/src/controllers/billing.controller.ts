import { Response } from "express";
import { InvoiceStatus } from "@prisma/client";
import { billingService } from "../services/billing.service";
import { getPagination } from "../utils/http";
import { apiSuccess } from "../utils/api-response";
import { AuthenticatedRequest } from "../types/auth";
import { getOptionalClinicScope, getScopedClinicId } from "../utils/tenant";
import { buildCacheKey, getOrSetCache, invalidateCacheByPrefix } from "../utils/response-cache";

export const billingController = {
  async list(req: AuthenticatedRequest, res: Response) {
    const { page, pageSize, search } = getPagination(req);
    const status =
      typeof req.query.status === "string" &&
      Object.values(InvoiceStatus).includes(req.query.status as InvoiceStatus)
        ? (req.query.status as InvoiceStatus)
        : undefined;
    const clinicId = getOptionalClinicScope(req);
    const cachePrefix = buildCacheKey("billing", clinicId ?? "all");
    const data = await getOrSetCache(
      buildCacheKey(cachePrefix, "list", page, pageSize, search ?? "", status ?? ""),
      45_000,
      () =>
        billingService.list({
          clinicId,
          page,
          pageSize,
          search,
          status
        })
    );
    res.json(apiSuccess(data));
  },

  async create(req: AuthenticatedRequest, res: Response) {
    const clinicId = getScopedClinicId(req);
    const data = await billingService.create(clinicId, req.body);
    invalidateCacheByPrefix(buildCacheKey("billing", clinicId));
    invalidateCacheByPrefix(buildCacheKey("dashboard", clinicId));
    res.status(201).json(apiSuccess(data, "Invoice created"));
  },

  async update(req: AuthenticatedRequest, res: Response) {
    const clinicId = getScopedClinicId(req);
    const data = await billingService.update(String(req.params.id), clinicId, req.body);
    invalidateCacheByPrefix(buildCacheKey("billing", clinicId));
    invalidateCacheByPrefix(buildCacheKey("dashboard", clinicId));
    res.json(apiSuccess(data, "Invoice updated"));
  },

  async remove(req: AuthenticatedRequest, res: Response) {
    const clinicId = getScopedClinicId(req);
    const data = await billingService.remove(String(req.params.id), clinicId);
    invalidateCacheByPrefix(buildCacheKey("billing", clinicId));
    invalidateCacheByPrefix(buildCacheKey("dashboard", clinicId));
    res.json(apiSuccess(data, "Invoice deleted"));
  }
};
