"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import ProtectedRoute from "@/components/auth/protected-route";
import { EntityCollectionView } from "@/components/ui/entity-collection-view";
import { RippleButton } from "@/components/ui/ripple-button";
import { useI18n } from "@/components/providers/i18n-provider";
import { clinicService } from "@/lib/clinic-service";

type ClinicRow = {
  name: string;
  slug: string;
  city: string;
  status: string;
};

export default function ClinicsPage() {
  const { t } = useI18n();
  const clinicsQuery = useQuery({
    queryKey: ["clinics", { page: 1, pageSize: 100 }],
    queryFn: () => clinicService.list()
  });

  const data =
    clinicsQuery.data?.map((clinic) => ({
      name: clinic.name,
      slug: clinic.slug,
      city: clinic.city ?? "-",
      status: clinic.isActive ? "Active" : "Inactive"
    })) ?? [];

  const columns: ColumnDef<ClinicRow>[] = [
    { header: t("nav.clinics"), accessorKey: "name" },
    { header: "Slug", accessorKey: "slug" },
    { header: "City", accessorKey: "city" },
    { header: "Status", accessorKey: "status" }
  ];

  return (
    <ProtectedRoute requiredPermissions={["clinics.read"]}>
      <AppShell>
        {clinicsQuery.isLoading ? (
          <div className="card p-6 text-sm text-slate-500">{t("clinics.loading")}</div>
        ) : (
          <EntityCollectionView
            title={t("nav.clinics")}
            columns={columns}
            data={data}
            storageKey="clinic-view"
            statusOptions={[
              { label: t("common.filters"), value: "all" },
              { label: "Active", value: "Active" }
            ]}
            searchPlaceholder={`${t("common.search")} ${t("nav.clinics")}`}
            addButton={<RippleButton>{`+ ${t("nav.clinics")}`}</RippleButton>}
            getSearchText={(row) => `${row.name} ${row.slug} ${row.city} ${row.status}`}
            getStatus={(row) => row.status}
            renderCard={(row) => (
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-900">{row.name}</h3>
                <p className="text-sm text-slate-500">{row.city}</p>
                <p className="text-xs text-orange-600">{row.status}</p>
              </div>
            )}
          />
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
