import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { permissionService } from "./permission.service";
import { AppError } from "../utils/app-error";

interface CreateClinicUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: string;
}

interface CreateRoleInput {
  name: string;
  permissionKeys: string[];
}

interface UpdateRolePermissionsInput {
  permissionKeys: string[];
}

export const adminService = {
  async listRoles(clinicId: string) {
    const roles = await prisma.role.findMany({
      where: { clinicId, deletedAt: null },
      include: {
        rolePermissions: {
          include: { permission: true }
        }
      },
      orderBy: [{ isSystem: "desc" }, { name: "asc" }]
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      isSystem: role.isSystem,
      permissions: role.rolePermissions.map((item) => item.permission.key)
    }));
  },

  async listPermissions() {
    return permissionService.listPermissionCatalog();
  },

  async listUsers(clinicId: string) {
    const users = await prisma.user.findMany({
      where: { clinicId, deletedAt: null },
      include: { role: true },
      orderBy: { createdAt: "desc" }
    });

    const roleIds = Array.from(new Set(users.map((user) => user.role.id)));
    const rolePermissionsEntries = await Promise.all(
      roleIds.map(async (roleId) => [roleId, await permissionService.getRolePermissions(roleId)] as const)
    );
    const rolePermissions = new Map<string, string[]>(rolePermissionsEntries);

    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleId: user.role.id,
      role: user.role.name,
      permissions: rolePermissions.get(user.role.id) ?? [],
      createdAt: user.createdAt
    }));
  },

  async createClinicUser(clinicId: string, input: CreateClinicUserInput) {
    const existing = await prisma.user.findFirst({
      where: {
        clinicId,
        email: input.email.toLowerCase(),
        deletedAt: null
      }
    });

    if (existing) {
      throw new AppError("User already exists in this clinic", 409);
    }

    const role = await prisma.role.findFirst({
      where: { id: input.roleId, clinicId, deletedAt: null }
    });

    if (!role || role.name === "SuperAdmin" || role.name === "ClinicAdmin") {
      throw new AppError("This role cannot be assigned by Clinic Admin", 403);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        clinicId,
        roleId: role.id,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email.toLowerCase(),
        passwordHash
      },
      include: { role: true }
    });

    const permissions = await permissionService.getRolePermissions(user.role.id);

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleId: user.role.id,
      role: user.role.name,
      permissions
    };
  },

  async createRole(clinicId: string, input: CreateRoleInput) {
    const roleName = input.name.trim();
    if (!roleName) {
      throw new AppError("Role name is required", 400);
    }

    if (["SuperAdmin", "ClinicAdmin"].includes(roleName)) {
      throw new AppError("Reserved role name", 400);
    }

    const role = await prisma.role.create({
      data: {
        clinicId,
        name: roleName,
        isSystem: false
      }
    });

    await permissionService.replaceRolePermissions(clinicId, role.id, input.permissionKeys);

    return {
      id: role.id,
      name: role.name,
      isSystem: role.isSystem,
      permissions: await permissionService.getRolePermissions(role.id)
    };
  },

  async updateRolePermissions(clinicId: string, roleId: string, input: UpdateRolePermissionsInput) {
    await permissionService.replaceRolePermissions(clinicId, roleId, input.permissionKeys);
    const role = await prisma.role.findFirstOrThrow({
      where: { id: roleId, clinicId, deletedAt: null }
    });

    return {
      id: role.id,
      name: role.name,
      isSystem: role.isSystem,
      permissions: await permissionService.getRolePermissions(role.id)
    };
  },

  async deleteRole(clinicId: string, roleId: string) {
    const role = await prisma.role.findFirst({
      where: { id: roleId, clinicId, deletedAt: null }
    });

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    if (role.isSystem || role.name === "SuperAdmin" || role.name === "ClinicAdmin") {
      throw new AppError("System role cannot be deleted", 403);
    }

    const assignedUsers = await prisma.user.count({
      where: { roleId: role.id, deletedAt: null }
    });

    if (assignedUsers > 0) {
      throw new AppError("Cannot delete role assigned to users", 409);
    }

    await prisma.role.update({
      where: { id: role.id },
      data: { deletedAt: new Date() }
    });
  },

  async updateUserRole(clinicId: string, userId: string, roleId: string) {
    const role = await prisma.role.findFirst({
      where: { id: roleId, clinicId, deletedAt: null }
    });

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    if (role.name === "SuperAdmin" || role.name === "ClinicAdmin") {
      throw new AppError("This role cannot be assigned by Clinic Admin", 403);
    }

    const existingUser = await prisma.user.findFirst({
      where: { id: userId, clinicId, deletedAt: null }
    });

    if (!existingUser) {
      throw new AppError("User not found", 404);
    }

    const user = await prisma.user.update({
      where: { id: existingUser.id },
      data: { roleId },
      include: { role: true }
    });

    return {
      id: user.id,
      roleId: user.role.id,
      role: user.role.name,
      permissions: await permissionService.getRolePermissions(user.role.id)
    };
  }
};
