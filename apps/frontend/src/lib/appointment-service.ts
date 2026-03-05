import { api } from "./api";

interface AppointmentPatient {
  fullName: string;
}

interface AppointmentDoctorUser {
  firstName: string;
  lastName: string;
}

interface AppointmentDoctor {
  user?: AppointmentDoctorUser | null;
}

export interface AppointmentListItem {
  id: string;
  startsAt: string;
  status: string;
  patient?: AppointmentPatient | null;
  doctor?: AppointmentDoctor | null;
}

interface AppointmentListPayload {
  data: AppointmentListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const appointmentService = {
  async list(clinicId?: string) {
    const res = await api.get<{ data: AppointmentListPayload }>("/appointments", {
      params: { page: 1, pageSize: 500, ...(clinicId ? { clinicId } : {}) }
    });
    return res.data.data.data;
  }
};
