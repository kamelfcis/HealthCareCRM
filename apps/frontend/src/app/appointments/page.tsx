"use client";
import { useEffect, useMemo, useState } from "react";

import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { EntityCollectionView } from "@/components/ui/entity-collection-view";
import { RippleButton } from "@/components/ui/ripple-button";
import { useI18n } from "@/components/providers/i18n-provider";
import { appointmentService } from "@/lib/appointment-service";
import { clinicService } from "@/lib/clinic-service";
import { storage } from "@/lib/storage";
import { RoleGate } from "@/components/auth/role-gate";

type AppointmentRow = {
  patient: string;
  doctor: string;
  start: string;
  status: string;
};

export default function AppointmentsPage() {
  const { t } = useI18n();
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof storage.getUser>>(null);
  useEffect(() => {
    setCurrentUser(storage.getUser());
  }, []);
  const isSuperAdmin = currentUser?.role === "SuperAdmin";
  const [selectedClinicId, setSelectedClinicId] = useState<string>("all");

  const clinicsQuery = useQuery({
    queryKey: ["clinics", "for-filter"],
    queryFn: () => clinicService.list(),
    enabled: isSuperAdmin
  });

  const appointmentsQuery = useQuery({
    queryKey: ["appointments", { page: 1, pageSize: 500, clinicId: selectedClinicId }],
    queryFn: () => appointmentService.list(selectedClinicId === "all" ? undefined : selectedClinicId)
  });

  const data: AppointmentRow[] = useMemo(
    () =>
      appointmentsQuery.data?.map((item) => ({
        patient: item.patient?.fullName ?? "-",
        doctor: `${item.doctor?.user?.firstName ?? ""} ${item.doctor?.user?.lastName ?? ""}`.trim() || "-",
        start: new Date(item.startsAt).toLocaleString(),
        status: item.status
      })) ?? [],
    [appointmentsQuery.data]
  );

  const statuses = useMemo(() => Array.from(new Set(data.map((item) => item.status))), [data]);
  const statusLabel = (status: string) => {
    const key = `status.${status}`;
    const translated = t(key);
    return translated === key ? status : translated;
  };

  const columns: ColumnDef<AppointmentRow>[] = [
    { header: t("nav.patients"), accessorKey: "patient" },
    { header: t("nav.doctors"), accessorKey: "doctor" },
    { header: "Start Time", accessorKey: "start" },
    {
      header: t("field.status"),
      id: "status",
      cell: ({ row }) => statusLabel(row.original.status)
    }
  ];

  return (
    <RoleGate requiredPermissions={["appointments.read"]} fallback={<div className="card p-6 text-sm text-slate-500">{t("common.notAllowed")}</div>}>
    <AppShell>
      {isSuperAdmin ? (
        <section className="mb-4 card bg-white/80 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-600">{t("dashboard.clinicScope")}</p>
            <select
              className="h-11 min-w-[220px] rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
              value={selectedClinicId}
              onChange={(event) => setSelectedClinicId(event.target.value)}
            >
              <option value="all">{t("common.allClinics")}</option>
              {(clinicsQuery.data ?? []).map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
          </div>
        </section>
      ) : null}
      {appointmentsQuery.isLoading ? (
        <div className="card p-6 text-sm text-slate-500">{t("appointments.loading")}</div>
      ) : (
        <EntityCollectionView
          title={t("nav.appointments")}
          columns={columns}
          data={data}
          storageKey="appointment-view"
          statusOptions={[
            { label: t("common.allStatuses"), value: "all" },
            ...statuses.map((status) => ({ label: statusLabel(status), value: status }))
          ]}
          searchPlaceholder={`${t("common.search")} ${t("nav.appointments")}`}
          addButton={<RippleButton>{`+ ${t("nav.appointments")}`}</RippleButton>}
          getSearchText={(row) => `${row.patient} ${row.doctor} ${row.start} ${row.status}`}
          getStatus={(row) => row.status}
          getDate={(row) => row.start.slice(0, 10)}
          renderCard={(row) => (
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900">{row.patient}</h3>
              <p className="text-sm text-slate-500">{row.doctor}</p>
              <p className="text-xs text-slate-500">{row.start}</p>
              <p className="text-xs text-orange-600">{statusLabel(row.status)}</p>
            </div>
          )}
        />
      )}
    </AppShell>
    </RoleGate>
  );
}
