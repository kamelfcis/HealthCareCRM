import { prisma } from "../config/prisma";

interface ListInput {
  clinicId?: string;
  page: number;
  pageSize: number;
  search?: string;
  specialty?: string;
}

export const doctorService = {
  async list(input: ListInput) {
    const normalizedSearch = input.search?.trim();
    const isShortSearch = Boolean(normalizedSearch && normalizedSearch.length <= 3);
    const where = {
      ...(input.clinicId ? { clinicId: input.clinicId } : {}),
      deletedAt: null,
      ...(input.specialty ? { specialty: input.specialty } : {}),
      ...(normalizedSearch
        ? {
            OR: [
              ...(isShortSearch
                ? [
                    { specialty: { startsWith: normalizedSearch, mode: "insensitive" as const } },
                    { licenseNumber: { startsWith: normalizedSearch, mode: "insensitive" as const } },
                    {
                      user: { firstName: { startsWith: normalizedSearch, mode: "insensitive" as const } }
                    },
                    {
                      user: { lastName: { startsWith: normalizedSearch, mode: "insensitive" as const } }
                    }
                  ]
                : []),
              { specialty: { contains: normalizedSearch, mode: "insensitive" as const } },
              { licenseNumber: { contains: normalizedSearch, mode: "insensitive" as const } },
              { user: { firstName: { contains: normalizedSearch, mode: "insensitive" as const } } },
              { user: { lastName: { contains: normalizedSearch, mode: "insensitive" as const } } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        include: { user: true },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        orderBy: { createdAt: "desc" }
      }),
      prisma.doctor.count({ where })
    ]);
    const totalPages = Math.max(1, Math.ceil(total / input.pageSize));
    return { data: items, total, page: input.page, pageSize: input.pageSize, totalPages };
  },

  create(clinicId: string, data: { userId: string; licenseNumber: string; specialty: string }) {
    return prisma.doctor.create({ data: { clinicId, ...data } });
  },

  update(id: string, clinicId: string, data: { specialty?: string; licenseNumber?: string }) {
    return prisma.doctor.updateMany({
      where: { id, clinicId, deletedAt: null },
      data
    });
  },

  remove(id: string, clinicId: string) {
    return prisma.doctor.updateMany({
      where: { id, clinicId, deletedAt: null },
      data: { deletedAt: new Date() }
    });
  }
};
