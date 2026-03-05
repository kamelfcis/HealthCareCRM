import { LeadSource, LeadStatus, Profession } from "@prisma/client";
import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import { apiSuccess } from "../utils/api-response";
import { getOptionalClinicScope, getScopedClinicId } from "../utils/tenant";
import { getPagination } from "../utils/http";
import { leadService } from "../services/lead.service";

export const leadController = {
  async list(req: AuthenticatedRequest, res: Response) {
    const { page, pageSize, search } = getPagination(req);
    const clinicId = getOptionalClinicScope(req);
    const status =
      typeof req.query.status === "string" && Object.values(LeadStatus).includes(req.query.status as LeadStatus)
        ? (req.query.status as LeadStatus)
        : undefined;
    const leadSource =
      typeof req.query.leadSource === "string" && Object.values(LeadSource).includes(req.query.leadSource as LeadSource)
        ? (req.query.leadSource as LeadSource)
        : undefined;
    const assignedToId = typeof req.query.assignedToId === "string" ? req.query.assignedToId : undefined;
    const data = await leadService.list({
      clinicId,
      page,
      pageSize,
      search,
      status,
      leadSource,
      assignedToId,
      viewerRole: req.user!.role,
      viewerUserId: req.user!.sub
    });
    res.json(apiSuccess(data));
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    const clinicId = getScopedClinicId(req);
    const data = await leadService.getById(String(req.params.id), clinicId, req.user!.role, req.user!.sub);
    res.json(apiSuccess(data));
  },

  async create(req: AuthenticatedRequest, res: Response) {
    const clinicId = getScopedClinicId(req);
    const data = await leadService.create({
      clinicId,
      ...req.body,
      createdById: req.user?.sub
    });
    res.status(201).json(apiSuccess(data, "Lead created"));
  },

  async update(req: AuthenticatedRequest, res: Response) {
    const clinicId = getScopedClinicId(req);
    const data = await leadService.update(String(req.params.id), clinicId, req.body);
    res.json(apiSuccess(data, "Lead updated"));
  },

  async changeStatus(req: AuthenticatedRequest, res: Response) {
    const clinicId = getScopedClinicId(req);
    const data = await leadService.changeStatus(String(req.params.id), clinicId, req.body.status as LeadStatus);
    res.json(apiSuccess(data, "Lead status updated"));
  },

  async addFollowUp(req: AuthenticatedRequest, res: Response) {
    const clinicId = getScopedClinicId(req);
    const data = await leadService.addFollowUp({
      clinicId,
      leadId: String(req.params.id),
      note: req.body.note,
      followUpDate: req.body.followUpDate,
      status: req.body.status as LeadStatus,
      createdById: req.user!.sub
    });
    res.status(201).json(apiSuccess(data, "Follow-up added"));
  },

  async convert(req: AuthenticatedRequest, res: Response) {
    const clinicId = getScopedClinicId(req);
    const data = await leadService.convertToPatient({
      clinicId,
      leadId: String(req.params.id),
      profession: req.body.profession as Profession,
      professionOther: req.body.professionOther,
      dateOfBirth: req.body.dateOfBirth,
      address: req.body.address
    });
    res.status(201).json(apiSuccess(data, "Lead converted to patient"));
  }
};
