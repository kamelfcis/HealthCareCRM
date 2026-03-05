import { api } from "./api";

export const clinicApi = {
  list: (params?: Record<string, string | number>) => api.get("/clinics", { params }),
  create: (payload: Record<string, unknown>) => api.post("/clinics", payload),
  update: (id: string, payload: Record<string, unknown>) => api.patch(`/clinics/${id}`, payload),
  remove: (id: string) => api.delete(`/clinics/${id}`)
};

export const doctorApi = {
  list: (params?: Record<string, string | number>) => api.get("/doctors", { params }),
  create: (payload: Record<string, unknown>) => api.post("/doctors", payload),
  update: (id: string, payload: Record<string, unknown>) => api.patch(`/doctors/${id}`, payload),
  remove: (id: string) => api.delete(`/doctors/${id}`)
};

export const patientApi = {
  list: (params?: Record<string, string | number>) => api.get("/patients", { params }),
  create: (payload: Record<string, unknown>) => api.post("/patients", payload),
  update: (id: string, payload: Record<string, unknown>) => api.patch(`/patients/${id}`, payload),
  remove: (id: string) => api.delete(`/patients/${id}`)
};

export const appointmentApi = {
  list: (params?: Record<string, string | number>) => api.get("/appointments", { params }),
  create: (payload: Record<string, unknown>) => api.post("/appointments", payload),
  update: (id: string, payload: Record<string, unknown>) => api.patch(`/appointments/${id}`, payload),
  remove: (id: string) => api.delete(`/appointments/${id}`)
};

export const billingApi = {
  list: (params?: Record<string, string | number>) => api.get("/billing", { params }),
  create: (payload: Record<string, unknown>) => api.post("/billing", payload),
  update: (id: string, payload: Record<string, unknown>) => api.patch(`/billing/${id}`, payload),
  remove: (id: string) => api.delete(`/billing/${id}`)
};

export const paymentApi = {
  list: (params?: Record<string, string | number>) => api.get("/payments", { params }),
  create: (payload: Record<string, unknown>) => api.post("/payments", payload),
  update: (id: string, payload: Record<string, unknown>) => api.patch(`/payments/${id}`, payload),
  remove: (id: string) => api.delete(`/payments/${id}`)
};
