import { api } from "./api";

export type LeadStatus = "NEW" | "CONTACTED" | "FOLLOW_UP" | "CONVERTED" | "LOST";
export type LeadSource = "FACEBOOK_AD" | "GOOGLE_SEARCH" | "DOCTOR_REFERRAL" | "FRIEND";

export interface LeadItem {
  id: string;
  fullName: string;
  phone: string;
  whatsapp?: string | null;
  leadSource: LeadSource;
  status: LeadStatus;
  notes?: string | null;
  assignedToId?: string | null;
  createdAt: string;
}

interface LeadsListPayload {
  data: LeadItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LeadFollowUp {
  id: string;
  note: string;
  followUpDate: string;
  status: LeadStatus;
  createdAt: string;
}

export interface LeadDetails extends LeadItem {
  followUps: LeadFollowUp[];
}

export const leadService = {
  async list(params?: Record<string, string | number | undefined>) {
    const res = await api.get<{ data: LeadsListPayload }>("/leads", { params });
    return res.data.data;
  },

  async getById(id: string) {
    const res = await api.get<{ data: LeadDetails }>(`/leads/${id}`);
    return res.data.data;
  },

  async create(payload: {
    fullName: string;
    phone: string;
    whatsapp?: string;
    leadSource: LeadSource;
    notes?: string;
    assignedToId?: string;
  }) {
    const res = await api.post<{ data: LeadItem }>("/leads", payload);
    return res.data.data;
  },

  async changeStatus(id: string, status: LeadStatus) {
    await api.patch(`/leads/${id}/status`, { status });
  },

  async addFollowUp(id: string, payload: { note: string; followUpDate: string; status: LeadStatus }) {
    await api.post(`/leads/${id}/followups`, payload);
  },

  async convertToPatient(
    id: string,
    payload: {
      profession: "ADMIN_EMPLOYEE" | "FREELANCER" | "DRIVER" | "ENGINEER" | "FACTORY_WORKER" | "OTHER";
      professionOther?: string;
      dateOfBirth?: string;
      address?: string;
    }
  ) {
    const res = await api.post(`/leads/${id}/convert`, payload);
    return res.data.data;
  }
};
