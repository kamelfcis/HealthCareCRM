import { prisma } from "../config/prisma";

interface ListInput {
  page: number;
  pageSize: number;
  search?: string;
}

export const clinicService = {
  async list(input: ListInput) {
    const normalizedSearch = input.search?.trim();
    const isShortSearch = Boolean(normalizedSearch && normalizedSearch.length <= 3);
    const where = {
      deletedAt: null,
      ...(normalizedSearch
        ? {
            OR: [
              ...(isShortSearch
                ? [
                    { name: { startsWith: normalizedSearch, mode: "insensitive" as const } },
                    { slug: { startsWith: normalizedSearch, mode: "insensitive" as const } }
                  ]
                : []),
              { name: { contains: normalizedSearch, mode: "insensitive" as const } },
              { slug: { contains: normalizedSearch, mode: "insensitive" as const } }
            ]
          }
        : {})
    };
    const [items, total] = await Promise.all([
      prisma.clinic.findMany({
        where,
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        orderBy: { createdAt: "desc" }
      }),
      prisma.clinic.count({ where })
    ]);
    const totalPages = Math.max(1, Math.ceil(total / input.pageSize));
    return { data: items, total, page: input.page, pageSize: input.pageSize, totalPages };
  },

  create(data: {
    name: string;
    slug: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    timezone?: string;
    specialtyCodes?: string[];
  }) {
    const { specialtyCodes, ...clinicData } = data;
    return prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({ data: clinicData });
      const normalizedCodes = Array.from(new Set((specialtyCodes ?? []).map((item) => item.trim().toUpperCase()).filter(Boolean)));
      if (normalizedCodes.length) {
        const specialties = await tx.specialtyCatalog.findMany({
          where: { code: { in: normalizedCodes }, isActive: true, deletedAt: null },
          select: { id: true }
        });
        if (specialties.length === normalizedCodes.length) {
          await tx.clinicSpecialty.createMany({
            data: specialties.map((specialty) => ({
              clinicId: clinic.id,
              specialtyId: specialty.id
            }))
          });
        }
      }
      return clinic;
    });
  },

  async getById(id: string) {
    return prisma.clinic.findFirstOrThrow({
      where: { id, deletedAt: null }
    });
  },

  async update(id: string, data: Record<string, unknown>) {
    const { specialtyCodes, ...clinicData } = data as Record<string, unknown> & { specialtyCodes?: string[] };
    return prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.update({ where: { id }, data: clinicData });
      if (Array.isArray(specialtyCodes) && specialtyCodes.length) {
        const normalizedCodes = Array.from(new Set(specialtyCodes.map((item) => item.trim().toUpperCase()).filter(Boolean)));
        const specialties = await tx.specialtyCatalog.findMany({
          where: { code: { in: normalizedCodes }, isActive: true, deletedAt: null },
          select: { id: true, code: true }
        });
        if (specialties.length !== normalizedCodes.length) {
          return clinic;
        }
        await tx.clinicSpecialty.deleteMany({ where: { clinicId: id } });
        await tx.clinicSpecialty.createMany({
          data: specialties.map((specialty) => ({
            clinicId: id,
            specialtyId: specialty.id
          }))
        });
      }
      return clinic;
    });
  },

  async remove(id: string) {
    return prisma.clinic.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false }
    });
  }
};
