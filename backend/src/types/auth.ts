import { Request } from "express";

export type RoleName = string;

export interface JwtPayload {
  sub: string;
  clinicId: string;
  role: RoleName;
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
