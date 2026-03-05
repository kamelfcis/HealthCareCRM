import { InvoiceStatus } from "@prisma/client";
import { prisma } from "../config/prisma";

interface ListInput {
  clinicId?: string;
  page: number;
  pageSize: number;
  search?: string;
  status?: InvoiceStatus;
}

export const billingService = {
  async list(input: ListInput) {
    const normalizedSearch = input.search?.trim();
    const isShortSearch = Boolean(normalizedSearch && normalizedSearch.length <= 3);
    const where = {
      ...(input.clinicId ? { clinicId: input.clinicId } : {}),
      deletedAt: null,
      ...(input.status ? { status: input.status } : {}),
      ...(normalizedSearch
        ? {
            OR: [
              ...(isShortSearch
                ? [
                    { invoiceNumber: { startsWith: normalizedSearch, mode: "insensitive" as const } },
                    { notes: { startsWith: normalizedSearch, mode: "insensitive" as const } }
                  ]
                : []),
              { invoiceNumber: { contains: normalizedSearch, mode: "insensitive" as const } },
              { notes: { contains: normalizedSearch, mode: "insensitive" as const } },
              {
                patient: { is: { fullName: { contains: normalizedSearch, mode: "insensitive" as const } } }
              }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: { patient: true, payments: true },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        orderBy: { createdAt: "desc" }
      }),
      prisma.invoice.count({ where })
    ]);

    const totalPages = Math.max(1, Math.ceil(total / input.pageSize));
    return { data: items, total, page: input.page, pageSize: input.pageSize, totalPages };
  },

  create(clinicId: string, data: { patientId: string; invoiceNumber: string; amount: number; dueDate?: string; notes?: string }) {
    return prisma.invoice.create({
      data: {
        clinicId,
        patientId: data.patientId,
        invoiceNumber: data.invoiceNumber,
        amount: data.amount,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes
      }
    });
  },

  update(id: string, clinicId: string, data: { status?: InvoiceStatus; notes?: string }) {
    return prisma.invoice.updateMany({
      where: { id, clinicId, deletedAt: null },
      data
    });
  },

  remove(id: string, clinicId: string) {
    return prisma.invoice.updateMany({
      where: { id, clinicId, deletedAt: null },
      data: { deletedAt: new Date(), status: "CANCELLED" }
    });
  }
};
