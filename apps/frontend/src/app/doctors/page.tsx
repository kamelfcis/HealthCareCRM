"use client";
import { useEffect, useMemo, useState } from "react";

import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { EntityCollectionView } from "@/components/ui/entity-collection-view";
import { RippleButton } from "@/components/ui/ripple-button";
import { useI18n } from "@/components/providers/i18n-provider";
import { clinicService } from "@/lib/clinic-service";
import { doctorService } from "@/lib/doctor-service";
import { storage } from "@/lib/storage";
import { RoleGate } from "@/components/auth/role-gate";

type DoctorRow = {
  name: string;
  specialty: string;
  license: string;
  availability: string;
};

export default function DoctorsPage() {
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

  const doctorsQuery = useQuery({
    queryKey: ["doctors", { page: 1, pageSize: 500, clinicId: selectedClinicId }],
    queryFn: () => doctorService.list(selectedClinicId === "all" ? undefined : selectedClinicId)
  });

  const data: DoctorRow[] = useMemo(
    () =>
      doctorsQuery.data?.map((doctor) => ({
        name: `${doctor.user?.firstName ?? ""} ${doctor.user?.lastName ?? ""}`.trim() || "Doctor",
        specialty: doctor.specialty,
        license: doctor.licenseNumber,
        availability: "-"
      })) ?? [],
    [doctorsQuery.data]
  );

  const specialties = useMemo(() => Array.from(new Set(data.map((item) => item.specialty))), [data]);

  const columns: ColumnDef<DoctorRow>[] = [
    { header: t("nav.doctors"), accessorKey: "name" },
    { header: "Specialty", accessorKey: "specialty" },
    { header: "License", accessorKey: "license" },
    { header: "Availability", accessorKey: "availability" }
  ];

  return (
    <RoleGate requiredPermissions={["doctors.read"]} fallback={<div className="card p-6 text-sm text-slate-500">{t("common.notAllowed")}</div>}>
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
      {doctorsQuery.isLoading ? (
        <div className="card p-6 text-sm text-slate-500">{t("doctors.loading")}</div>
      ) : (
        <EntityCollectionView
          title={t("nav.doctors")}
          columns={columns}
          data={data}
          storageKey="doctor-view"
          statusOptions={[
            { label: t("common.allSpecialties"), value: "all" },
            ...specialties.map((specialty) => ({ label: specialty, value: specialty }))
          ]}
          searchPlaceholder={`${t("common.search")} ${t("nav.doctors")}`}
          addButton={<RippleButton>{`+ ${t("nav.doctors")}`}</RippleButton>}
          getSearchText={(row) => `${row.name} ${row.specialty} ${row.license} ${row.availability}`}
          getStatus={(row) => row.specialty}
          renderCard={(row) => (
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900">{row.name}</h3>
              <p className="text-sm text-slate-500">{row.specialty}</p>
              <p className="text-xs text-orange-600">{row.availability}</p>
            </div>
          )}
        />
      )}
    </AppShell>
    </RoleGate>
  );
}
