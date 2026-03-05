import { api } from "./api";

export interface ClinicItem {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  timezone?: string | null;
  isActive: boolean;
}

interface ClinicsListResponse {
  data: ClinicItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const clinicService = {
  async list() {
    const res = await api.get<{ data: ClinicsListResponse }>("/clinics?page=1&pageSize=100");
    return res.data.data.data;
  },

  async getMyClinic() {
    const res = await api.get<{ data: ClinicItem }>("/clinics/me");
    return res.data.data;
  },

  async updateMyClinic(payload: FormData) {
    const res = await api.patch<{ data: ClinicItem }>("/clinics/me", payload, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return res.data.data;
  }
};
