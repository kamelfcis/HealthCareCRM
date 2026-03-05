import { AuthenticatedRequest } from "../types/auth";
import { AppError } from "./app-error";

export const getScopedClinicId = (req: AuthenticatedRequest) => {
  if (!req.user?.clinicId) {
    throw new AppError("Missing clinic scope", 401);
  }
  return req.user.clinicId;
};

export const getOptionalClinicScope = (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const requestedClinicId = typeof req.query.clinicId === "string" ? req.query.clinicId.trim() : undefined;
  if (req.user.role === "SuperAdmin") {
    return requestedClinicId || undefined;
  }

  return req.user.clinicId;
};
