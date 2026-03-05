"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { RippleButton } from "@/components/ui/ripple-button";
import { Modal } from "@/components/ui/modal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { leadService, LeadStatus } from "@/lib/lead-service";
import { storage } from "@/lib/storage";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/i18n-provider";
import { hasPermission } from "@/lib/permissions";

export default function LeadDetailsPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const leadId = String(params.id);
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof storage.getUser>>(null);
  useEffect(() => {
    setCurrentUser(storage.getUser());
  }, []);
  const canConvert = hasPermission(currentUser, "leads.convert");
  const statusLabel = (value: LeadStatus) => t(`lead.status.${value}`);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [followUpNote, setFollowUpNote] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [status, setStatus] = useState<LeadStatus>("FOLLOW_UP");

  const leadQuery = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => leadService.getById(leadId)
  });

  const addFollowUpMutation = useMutation({
    mutationFn: (payload: { note: string; followUpDate: string; status: LeadStatus }) =>
      leadService.addFollowUp(leadId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      setOpen(false);
      setFollowUpNote("");
      setFollowUpDate("");
      setStatus("FOLLOW_UP");
    }
  });

  const statusMutation = useMutation({
    mutationFn: (nextStatus: LeadStatus) => leadService.changeStatus(leadId, nextStatus),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
    }
  });

  const convertMutation = useMutation({
    mutationFn: () =>
      leadService.convertToPatient(leadId, {
        profession: "ADMIN_EMPLOYEE"
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
    }
  });

  if (leadQuery.isLoading) {
    return (
      <AppShell>
        <div className="card p-6 text-sm text-slate-500">Loading lead details...</div>
      </AppShell>
    );
  }

  if (!leadQuery.data) {
    return (
      <AppShell>
        <div className="card p-6 text-sm text-slate-500">Lead not found.</div>
      </AppShell>
    );
  }

  const lead = leadQuery.data;
  return (
    <AppShell>
      <section className="card bg-white/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-brand-navy">{lead.fullName}</h1>
            <p className="text-sm text-slate-500">{lead.phone}</p>
          </div>
          <div className="flex gap-2">
            <select
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
              value={lead.status}
              onChange={(event) => statusMutation.mutate(event.target.value as LeadStatus)}
            >
              <option value="NEW">{statusLabel("NEW")}</option>
              <option value="CONTACTED">{statusLabel("CONTACTED")}</option>
              <option value="FOLLOW_UP">{statusLabel("FOLLOW_UP")}</option>
              <option value="CONVERTED">{statusLabel("CONVERTED")}</option>
              <option value="LOST">{statusLabel("LOST")}</option>
            </select>
            <RippleButton onClick={() => setOpen(true)}>Add Follow-up</RippleButton>
            {canConvert ? (
              <RippleButton
                onClick={() => convertMutation.mutate()}
                disabled={convertMutation.isPending}
              >
                Convert to Patient
              </RippleButton>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <RippleButton
                        type="button"
                        disabled
                        onClick={() => {
                          toast.error("Not allowed: only Admin can convert a lead to patient.");
                        }}
                      >
                        Convert to Patient
                      </RippleButton>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Only Clinic Admin or Super Admin can convert leads.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </section>

      <section className="mt-4 card bg-white/80 p-6">
        <h2 className="text-lg font-semibold text-brand-navy">Follow-up Timeline</h2>
        <div className="mt-4 space-y-3">
          {lead.followUps.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{statusLabel(item.status)}</span>
                <span>{new Date(item.followUpDate).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{item.note}</p>
            </div>
          ))}
          {!lead.followUps.length ? <p className="text-sm text-slate-500">No follow-ups yet.</p> : null}
        </div>
      </section>

      <Modal open={open} title="Add Follow-up" onClose={() => setOpen(false)}>
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            await addFollowUpMutation.mutateAsync({
              note: followUpNote,
              followUpDate,
              status
            });
          }}
        >
          <textarea
            className="h-24 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none"
            placeholder="Note"
            value={followUpNote}
            onChange={(event) => setFollowUpNote(event.target.value)}
          />
          <input
            type="datetime-local"
            className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none"
            value={followUpDate}
            onChange={(event) => setFollowUpDate(event.target.value)}
          />
          <select
            className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none"
            value={status}
            onChange={(event) => setStatus(event.target.value as LeadStatus)}
          >
            <option value="NEW">{statusLabel("NEW")}</option>
            <option value="CONTACTED">{statusLabel("CONTACTED")}</option>
            <option value="FOLLOW_UP">{statusLabel("FOLLOW_UP")}</option>
            <option value="CONVERTED">{statusLabel("CONVERTED")}</option>
            <option value="LOST">{statusLabel("LOST")}</option>
          </select>
          <RippleButton type="submit" disabled={addFollowUpMutation.isPending}>
            {addFollowUpMutation.isPending ? "Saving..." : "Save Follow-up"}
          </RippleButton>
        </form>
      </Modal>
    </AppShell>
  );
}
