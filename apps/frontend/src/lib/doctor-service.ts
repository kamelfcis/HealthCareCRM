import { api } from "./api";

interface DoctorUser {
  firstName: string;
  lastName: string;
}

export interface DoctorListItem {
  id: string;
  specialty: string;
  licenseNumber: string;
  user?: DoctorUser | null;
}

interface DoctorListPayload {
  data: DoctorListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const doctorService = {
  async list(clinicId?: string) {
    const res = await api.get<{ data: DoctorListPayload }>("/doctors", {
      params: { page: 1, pageSize: 500, ...(clinicId ? { clinicId } : {}) }
    });
    return res.data.data.data;
  }
};
