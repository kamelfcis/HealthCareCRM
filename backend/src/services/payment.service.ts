import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { prisma } from "../config/prisma";

interface ListInput {
  clinicId?: string;
  page: number;
  pageSize: number;
  search?: string;
  status?: PaymentStatus;
}

export const paymentService = {
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
                    { transactionRef: { startsWith: normalizedSearch, mode: "insensitive" as const } },
                    { invoice: { invoiceNumber: { startsWith: normalizedSearch, mode: "insensitive" as const } } }
                  ]
                : []),
              { transactionRef: { contains: normalizedSearch, mode: "insensitive" as const } },
              { invoice: { invoiceNumber: { contains: normalizedSearch, mode: "insensitive" as const } } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: { invoice: true },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        orderBy: { createdAt: "desc" }
      }),
      prisma.payment.count({ where })
    ]);
    const totalPages = Math.max(1, Math.ceil(total / input.pageSize));
    return { data: items, total, page: input.page, pageSize: input.pageSize, totalPages };
  },

  async create(
    clinicId: string,
    data: {
      invoiceId: string;
      amount: number;
      method: PaymentMethod;
      transactionRef?: string;
      status?: PaymentStatus;
    }
  ) {
    const payment = await prisma.payment.create({
      data: {
        clinicId,
        invoiceId: data.invoiceId,
        amount: data.amount,
        method: data.method,
        transactionRef: data.transactionRef,
        status: data.status ?? "SUCCESS",
        paidAt: new Date()
      }
    });

    await prisma.invoice.update({
      where: { id: data.invoiceId },
      data: { status: "PAID" }
    });

    return payment;
  },

  update(id: string, clinicId: string, data: { status?: PaymentStatus; transactionRef?: string }) {
    return prisma.payment.updateMany({
      where: { id, clinicId, deletedAt: null },
      data
    });
  },

  remove(id: string, clinicId: string) {
    return prisma.payment.updateMany({
      where: { id, clinicId, deletedAt: null },
      data: { deletedAt: new Date() }
    });
  }
};
