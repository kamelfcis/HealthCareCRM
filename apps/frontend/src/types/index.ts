export type RoleName = string;

export interface AuthUser {
  id: string;
  clinicId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleName;
  permissions: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RoleDefinition {
  id: string;
  name: RoleName;
  isSystem: boolean;
  permissions: string[];
}

export interface ClinicSpecialty {
  id: string;
  code: string;
  name: string;
  nameAr: string;
}
