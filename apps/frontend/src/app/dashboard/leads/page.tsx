"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { EntityCollectionView } from "@/components/ui/entity-collection-view";
import { RippleButton } from "@/components/ui/ripple-button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Modal } from "@/components/ui/modal";
import { leadService, LeadSource, LeadStatus } from "@/lib/lead-service";
import { useI18n } from "@/components/providers/i18n-provider";

type LeadRow = {
  id: string;
  fullName: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  createdAt: string;
};

export default function LeadsPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const sourceLabel = (value: LeadSource) => t(`lead.source.${value}`);
  const statusLabel = (value: LeadStatus) => t(`lead.status.${value}`);
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    whatsapp: "",
    leadSource: "GOOGLE_SEARCH" as LeadSource,
    notes: ""
  });

  const leadsQuery = useQuery({
    queryKey: ["leads", sourceFilter, statusFilter],
    queryFn: () =>
      leadService.list({
        page: 1,
        pageSize: 100,
        leadSource: sourceFilter === "all" ? undefined : sourceFilter,
        status: statusFilter === "all" ? undefined : statusFilter
      })
  });

  const createMutation = useMutation({
    mutationFn: leadService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      setOpen(false);
      setForm({ fullName: "", phone: "", whatsapp: "", leadSource: "GOOGLE_SEARCH", notes: "" });
    }
  });

  const rows: LeadRow[] = useMemo(
    () =>
      leadsQuery.data?.data.map((item) => ({
        id: item.id,
        fullName: item.fullName,
        phone: item.phone,
        source: item.leadSource,
        status: item.status,
        createdAt: item.createdAt.slice(0, 10)
      })) ?? [],
    [leadsQuery.data]
  );

  const columns: ColumnDef<LeadRow>[] = [
    { header: "Name", accessorKey: "fullName" },
    { header: "Phone", accessorKey: "phone" },
    {
      header: "Source",
      id: "source",
      cell: ({ row }) => sourceLabel(row.original.source)
    },
    {
      header: "Status",
      id: "status",
      cell: ({ row }) => statusLabel(row.original.status)
    },
    { header: "Created", accessorKey: "createdAt" },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <Link href={`/dashboard/leads/${row.original.id}`} className="text-sm text-orange-600 hover:underline">
          Open
        </Link>
      )
    }
  ];

  return (
    <AppShell>
      <div className="mb-4 card bg-white/80 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <select
            className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none"
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value as LeadSource | "all")}
          >
            <option value="all">{t("common.allSources")}</option>
            <option value="FACEBOOK_AD">{sourceLabel("FACEBOOK_AD")}</option>
            <option value="GOOGLE_SEARCH">{sourceLabel("GOOGLE_SEARCH")}</option>
            <option value="DOCTOR_REFERRAL">{sourceLabel("DOCTOR_REFERRAL")}</option>
            <option value="FRIEND">{sourceLabel("FRIEND")}</option>
          </select>
          <select
            className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as LeadStatus | "all")}
          >
            <option value="all">{t("common.allStatuses")}</option>
            <option value="NEW">{statusLabel("NEW")}</option>
            <option value="CONTACTED">{statusLabel("CONTACTED")}</option>
            <option value="FOLLOW_UP">{statusLabel("FOLLOW_UP")}</option>
            <option value="CONVERTED">{statusLabel("CONVERTED")}</option>
            <option value="LOST">{statusLabel("LOST")}</option>
          </select>
          <RippleButton onClick={() => setOpen(true)}>+ New Lead</RippleButton>
        </div>
      </div>
      {leadsQuery.isLoading ? (
        <div className="card p-6 text-sm text-slate-500">Loading leads...</div>
      ) : (
        <EntityCollectionView
          title="Leads"
          columns={columns}
          data={rows}
          storageKey="lead-view"
          statusOptions={[
            { label: t("common.all"), value: "all" },
            { label: statusLabel("NEW"), value: "NEW" },
            { label: statusLabel("CONTACTED"), value: "CONTACTED" },
            { label: statusLabel("FOLLOW_UP"), value: "FOLLOW_UP" },
            { label: statusLabel("CONVERTED"), value: "CONVERTED" },
            { label: statusLabel("LOST"), value: "LOST" }
          ]}
          searchPlaceholder={`${t("common.search")} leads`}
          addButton={<span />}
          getSearchText={(row) => `${row.fullName} ${row.phone} ${row.source} ${row.status}`}
          getStatus={(row) => row.status}
          getDate={(row) => row.createdAt}
          renderCard={(row) => (
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900">{row.fullName}</h3>
              <p className="text-sm text-slate-500">{row.phone}</p>
              <p className="text-xs text-slate-500">{sourceLabel(row.source)}</p>
              <p className="text-xs text-orange-600">{statusLabel(row.status)}</p>
            </div>
          )}
        />
      )}

      <Modal open={open} title="Create Lead" onClose={() => setOpen(false)}>
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            await createMutation.mutateAsync({
              fullName: form.fullName,
              phone: form.phone,
              whatsapp: form.whatsapp || undefined,
              leadSource: form.leadSource,
              notes: form.notes || undefined
            });
          }}
        >
          <FloatingInput
            id="lead-full-name"
            label="Full Name"
            value={form.fullName}
            onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
            required
          />
          <FloatingInput
            id="lead-phone"
            label="Phone"
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            required
          />
          <FloatingInput
            id="lead-whatsapp"
            label="WhatsApp"
            value={form.whatsapp}
            onChange={(event) => setForm((prev) => ({ ...prev, whatsapp: event.target.value }))}
          />
          <select
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none"
            value={form.leadSource}
            onChange={(event) => setForm((prev) => ({ ...prev, leadSource: event.target.value as LeadSource }))}
          >
            <option value="FACEBOOK_AD">{sourceLabel("FACEBOOK_AD")}</option>
            <option value="GOOGLE_SEARCH">{sourceLabel("GOOGLE_SEARCH")}</option>
            <option value="DOCTOR_REFERRAL">{sourceLabel("DOCTOR_REFERRAL")}</option>
            <option value="FRIEND">{sourceLabel("FRIEND")}</option>
          </select>
          <textarea
            className="h-24 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none"
            placeholder="Notes"
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          />
          <RippleButton type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving..." : "Create Lead"}
          </RippleButton>
        </form>
      </Modal>
    </AppShell>
  );
}
