import { prisma } from "../config/prisma";

export const dashboardService = {
  async metrics(clinicId?: string) {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const [totalPatients, appointmentsToday, activeDoctors, outstandingInvoiceAgg] = await Promise.all([
      prisma.patient.count({
        where: { ...(clinicId ? { clinicId } : {}), deletedAt: null }
      }),
      prisma.appointment.count({
        where: {
          ...(clinicId ? { clinicId } : {}),
          deletedAt: null,
          startsAt: { gte: dayStart, lt: dayEnd }
        }
      }),
      prisma.doctor.count({
        where: { ...(clinicId ? { clinicId } : {}), deletedAt: null }
      }),
      prisma.invoice.aggregate({
        where: {
          ...(clinicId ? { clinicId } : {}),
          deletedAt: null,
          status: { not: "PAID" }
        },
        _sum: { amount: true }
      })
    ]);

    return {
      totalPatients,
      appointmentsToday,
      activeDoctors,
      outstandingInvoices: outstandingInvoiceAgg._sum.amount ?? 0
    };
  }
};
