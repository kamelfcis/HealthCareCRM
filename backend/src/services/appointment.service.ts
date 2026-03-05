import { AppointmentStatus } from "@prisma/client";
import { prisma } from "../config/prisma";

interface ListInput {
  clinicId?: string;
  page: number;
  pageSize: number;
  search?: string;
  status?: AppointmentStatus;
}

export const appointmentService = {
  async list(input: ListInput) {
    const where = {
      ...(input.clinicId ? { clinicId: input.clinicId } : {}),
      deletedAt: null,
      ...(input.status ? { status: input.status } : {}),
      ...(input.search
        ? {
            OR: [
              { reason: { contains: input.search, mode: "insensitive" as const } },
              {
                patient: {
                  is: { fullName: { contains: input.search, mode: "insensitive" as const } }
                }
              }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: true,
          doctor: { include: { user: true } }
        },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        orderBy: { startsAt: "asc" }
      }),
      prisma.appointment.count({ where })
    ]);
    const totalPages = Math.max(1, Math.ceil(total / input.pageSize));
    return { data: items, total, page: input.page, pageSize: input.pageSize, totalPages };
  },

  create(
    clinicId: string,
    data: {
      doctorId: string;
      patientId: string;
      startsAt: string;
      endsAt: string;
      reason?: string;
      notes?: string;
      status?: AppointmentStatus;
    }
  ) {
    return prisma.appointment.create({
      data: {
        clinicId,
        doctorId: data.doctorId,
        patientId: data.patientId,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
        reason: data.reason || null,
        notes: data.notes || null,
        status: data.status ?? "SCHEDULED"
      }
    });
  },

  update(id: string, clinicId: string, data: Record<string, unknown>) {
    return prisma.appointment.updateMany({
      where: { id, clinicId, deletedAt: null },
      data
    });
  },

  remove(id: string, clinicId: string) {
    return prisma.appointment.updateMany({
      where: { id, clinicId, deletedAt: null },
      data: { deletedAt: new Date(), status: "CANCELLED" }
    });
  }
};
