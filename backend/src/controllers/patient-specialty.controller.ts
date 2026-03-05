import { Response } from "express";
import { z } from "zod";
import { apiSuccess } from "../utils/api-response";
import { AuthenticatedRequest } from "../types/auth";
import { getOptionalClinicScope } from "../utils/tenant";
import { patientSpecialtyService } from "../services/patient-specialty.service";
import { invalidateCacheByPrefix, buildCacheKey } from "../utils/response-cache";

const upsertSchema = z.object({
  values: z.record(z.string(), z.unknown())
});

export const patientSpecialtyController = {
  async template(req: AuthenticatedRequest, res: Response) {
    const clinicId = getOptionalClinicScope(req);
    const data = await patientSpecialtyService.getTemplate(
      String(req.params.id),
      clinicId,
      String(req.params.specialtyCode)
    );
    res.json(apiSuccess({ specialty: data.specialty, template: data.template }));
  },

  async getAssessment(req: AuthenticatedRequest, res: Response) {
    const clinicId = getOptionalClinicScope(req);
    const data = await patientSpecialtyService.getAssessment(
      String(req.params.id),
      clinicId,
      String(req.params.specialtyCode)
    );
    res.json(apiSuccess(data));
  },

  async upsertAssessment(req: AuthenticatedRequest, res: Response) {
    const clinicId = getOptionalClinicScope(req);
    const parsed = upsertSchema.parse(req.body);
    const data = await patientSpecialtyService.upsertAssessment(
      String(req.params.id),
      clinicId,
      String(req.params.specialtyCode),
      parsed.values
    );
    invalidateCacheByPrefix(buildCacheKey("patients", clinicId ?? "all"));
    res.json(apiSuccess(data, "Specialty assessment saved"));
  }
};
