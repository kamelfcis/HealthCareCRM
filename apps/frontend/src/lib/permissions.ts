import { AuthUser } from "@/types";

export const hasPermission = (user: AuthUser | null | undefined, permission: string) => {
  if (!user) return false;
  if (user.role === "SuperAdmin") return true;
  return user.permissions.includes(permission);
};

export const hasAnyPermission = (user: AuthUser | null | undefined, permissions: string[]) => {
  if (!permissions.length) return true;
  return permissions.some((permission) => hasPermission(user, permission));
};

export const hasAllPermissions = (user: AuthUser | null | undefined, permissions: string[]) => {
  if (!permissions.length) return true;
  return permissions.every((permission) => hasPermission(user, permission));
};
