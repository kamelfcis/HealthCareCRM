import { Response } from "express";
import { medicalRecordService } from "../services/medical-record.service";
import { getPagination } from "../utils/http";
import { apiSuccess } from "../utils/api-response";
import { AuthenticatedRequest } from "../types/auth";
import { getScopedClinicId } from "../utils/tenant";

export const medicalRecordController = {
  async list(req: AuthenticatedRequest, res: Response) {
    const { page, pageSize, search } = getPagination(req);
    const data = await medicalRecordService.list({
      clinicId: getScopedClinicId(req),
      page,
      pageSize,
      search
    });
    res.json(apiSuccess(data));
  },

  async create(req: AuthenticatedRequest, res: Response) {
    const data = await medicalRecordService.create(getScopedClinicId(req), req.body);
    res.status(201).json(apiSuccess(data, "Medical record created"));
  },

  async update(req: AuthenticatedRequest, res: Response) {
    const data = await medicalRecordService.update(
      String(req.params.id),
      getScopedClinicId(req),
      req.body
    );
    res.json(apiSuccess(data, "Medical record updated"));
  },

  async remove(req: AuthenticatedRequest, res: Response) {
    const data = await medicalRecordService.remove(String(req.params.id), getScopedClinicId(req));
    res.json(apiSuccess(data, "Medical record deleted"));
  }
};
