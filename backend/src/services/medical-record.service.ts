import { prisma } from "../config/prisma";

interface ListInput {
  clinicId: string;
  page: number;
  pageSize: number;
  search?: string;
}

export const medicalRecordService = {
  async list(input: ListInput) {
    const where = {
      clinicId: input.clinicId,
      deletedAt: null,
      ...(input.search
        ? {
            OR: [
              { diagnosis: { contains: input.search, mode: "insensitive" as const } },
              { treatment: { contains: input.search, mode: "insensitive" as const } },
              {
                patient: { is: { fullName: { contains: input.search, mode: "insensitive" as const } } }
              }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.medicalRecord.findMany({
        where,
        include: { patient: true },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        orderBy: { createdAt: "desc" }
      }),
      prisma.medicalRecord.count({ where })
    ]);
    const totalPages = Math.max(1, Math.ceil(total / input.pageSize));
    return { data: items, total, page: input.page, pageSize: input.pageSize, totalPages };
  },

  create(
    clinicId: string,
    data: {
      patientId: string;
      diagnosis: string;
      treatment?: string;
      notes?: string;
      createdById?: string;
    }
  ) {
    return prisma.medicalRecord.create({
      data: {
        clinicId,
        patientId: data.patientId,
        diagnosis: data.diagnosis,
        treatment: data.treatment || null,
        notes: data.notes || null,
        createdById: data.createdById || null
      }
    });
  },

  update(id: string, clinicId: string, data: Record<string, unknown>) {
    return prisma.medicalRecord.updateMany({
      where: { id, clinicId, deletedAt: null },
      data
    });
  },

  remove(id: string, clinicId: string) {
    return prisma.medicalRecord.updateMany({
      where: { id, clinicId, deletedAt: null },
      data: { deletedAt: new Date() }
    });
  }
};
