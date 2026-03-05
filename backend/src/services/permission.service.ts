import { prisma } from "../config/prisma";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSION_CATALOG, SYSTEM_ROLE_NAMES } from "../constants/permissions";
import { AppError } from "../utils/app-error";

const getPermissionIdsByKey = async (keys: string[]) => {
  const permissions = await prisma.permission.findMany({
    where: { key: { in: keys } },
    select: { id: true, key: true }
  });

  if (permissions.length !== keys.length) {
    const found = new Set(permissions.map((item) => item.key));
    const missing = keys.filter((key) => !found.has(key));
    throw new AppError(`Unknown permission keys: ${missing.join(", ")}`, 400);
  }

  return permissions.map((item) => item.id);
};

export const permissionService = {
  async seedPermissionCatalog() {
    for (const permission of PERMISSION_CATALOG) {
      await prisma.permission.upsert({
        where: { key: permission.key },
        update: {
          label: permission.label,
          category: permission.category
        },
        create: permission
      });
    }
  },

  async ensureDefaultRoles(clinicId: string) {
    await this.seedPermissionCatalog();

    for (const [roleName, permissionKeys] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
      const role = await prisma.role.upsert({
        where: {
          clinicId_name: {
            clinicId,
            name: roleName
          }
        },
        update: {
          deletedAt: null,
          isSystem: SYSTEM_ROLE_NAMES.includes(roleName as (typeof SYSTEM_ROLE_NAMES)[number])
        },
        create: {
          clinicId,
          name: roleName,
          isSystem: SYSTEM_ROLE_NAMES.includes(roleName as (typeof SYSTEM_ROLE_NAMES)[number])
        }
      });

      await this.replaceRolePermissions(clinicId, role.id, permissionKeys, true);
    }
  },

  async listPermissionCatalog() {
    return prisma.permission.findMany({
      where: {},
      orderBy: [{ category: "asc" }, { key: "asc" }]
    });
  },

  async getRolePermissions(roleId: string) {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true }
    });
    return rolePermissions.map((item) => item.permission.key);
  },

  async getUserPermissions(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true }
            }
          }
        }
      }
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user.role.rolePermissions.map((item) => item.permission.key);
  },

  async replaceRolePermissions(clinicId: string, roleId: string, permissionKeys: string[], allowSystemRole = false) {
    const role = await prisma.role.findFirst({
      where: { id: roleId, clinicId, deletedAt: null }
    });

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    if (role.isSystem && !allowSystemRole) {
      throw new AppError("System role permissions cannot be modified", 403);
    }

    const uniqueKeys = Array.from(new Set(permissionKeys));
    const permissionIds = await getPermissionIdsByKey(uniqueKeys);

    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId } }),
      prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId }))
      })
    ]);
  }
};
