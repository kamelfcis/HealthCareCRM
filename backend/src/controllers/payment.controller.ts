import { Response } from "express";
import { PaymentStatus } from "@prisma/client";
import { paymentService } from "../services/payment.service";
import { getPagination } from "../utils/http";
import { apiSuccess } from "../utils/api-response";
import { AuthenticatedRequest } from "../types/auth";
import { getOptionalClinicScope, getScopedClinicId } from "../utils/tenant";
import { buildCacheKey, getOrSetCache, invalidateCacheByPrefix } from "../utils/response-cache";

export const paymentController = {
  async list(req: AuthenticatedRequest, res: Response) {
    const { page, pageSize, search } = getPagination(req);
    const status =
      typeof req.query.status === "string" &&
      Object.values(PaymentStatus).includes(req.query.status as PaymentStatus)
        ? (req.query.status as PaymentStatus)
        : undefined;
    const clinicId = getOptionalClinicScope(req);
    const cachePrefix = buildCacheKey("payments", clinicId ?? "all");
    const data = await getOrSetCache(
      buildCacheKey(cachePrefix, "list", page, pageSize, search ?? "", status ?? ""),
      45_000,
      () =>
        paymentService.list({
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
    const data = await paymentService.create(clinicId, req.body);
    invalidateCacheByPrefix(buildCacheKey("payments", clinicId));
    invalidateCacheByPrefix(buildCacheKey("dashboard", clinicId));
    res.status(201).json(apiSuccess(data, "Payment created"));
  },

  async update(req: AuthenticatedRequest, res: Response) {
    const clinicId = getScopedClinicId(req);
    const data = await paymentService.update(String(req.params.id), clinicId, req.body);
    invalidateCacheByPrefix(buildCacheKey("payments", clinicId));
    invalidateCacheByPrefix(buildCacheKey("dashboard", clinicId));
    res.json(apiSuccess(data, "Payment updated"));
  },

  async remove(req: AuthenticatedRequest, res: Response) {
    const clinicId = getScopedClinicId(req);
    const data = await paymentService.remove(String(req.params.id), clinicId);
    invalidateCacheByPrefix(buildCacheKey("payments", clinicId));
    invalidateCacheByPrefix(buildCacheKey("dashboard", clinicId));
    res.json(apiSuccess(data, "Payment deleted"));
  }
};
