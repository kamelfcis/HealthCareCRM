"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, ChevronDown, ClipboardList, Loader2, MapPin, PhoneCall, PhoneOff, PhoneOutgoing, SquarePen, Trash2, TriangleAlert, User, UserPlus, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PatientForm, PatientFormValues } from "@/components/forms/patient-form";
import { SpecialtyAssessmentForm } from "@/components/forms/specialty-assessment-form";
import { RippleButton } from "@/components/ui/ripple-button";
import { toast } from "sonner";
import { EntityCollectionView } from "@/components/ui/entity-collection-view";
import { useI18n } from "@/components/providers/i18n-provider";
import { clinicService } from "@/lib/clinic-service";
import { patientService, PatientStats } from "@/lib/patient-service";
import { storage } from "@/lib/storage";
import { StatCard } from "@/components/ui/stat-card";
import { RoleGate } from "@/components/auth/role-gate";
import { cn } from "@/lib/utils";
import { specialtyService } from "@/lib/specialty-service";

type PatientRow = {
  id: string;
  name: string;
  nationalId?: string | null;
  phone: string;
  whatsapp: string;
  fileNumber: number;
  age: number | null;
  profession: string;
  professionOther?: string | null;
  leadSource: string;
  leadSourceOther?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  clinicName?: string;
  lastVisit: string;
};

export default function PatientsPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof storage.getUser>>(null);
  useEffect(() => {
    setCurrentUser(storage.getUser());
  }, []);
  const isSuperAdmin = currentUser?.role === "SuperAdmin";
  const [selectedClinicId, setSelectedClinicId] = useState<string>("all");
  const [formExpanded, setFormExpanded] = useState(false);
  const [editing, setEditing] = useState<PatientRow | null>(null);
  const [assessmentPatient, setAssessmentPatient] = useState<PatientRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PatientRow | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const formRef = useRef<HTMLElement | null>(null);
  const assessmentRef = useRef<HTMLElement | null>(null);
  const scrollToFormTop = useCallback(() => {
    const formEl = formRef.current;
    if (!formEl) return;

    const scrollContainer = formEl.closest("main");
    if (!(scrollContainer instanceof HTMLElement)) {
      formEl.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const formRect = formEl.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    const targetTop = scrollContainer.scrollTop + (formRect.top - containerRect.top) - 8;
    scrollContainer.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  }, []);
  const scrollToAssessmentTop = useCallback(() => {
    const assessmentEl = assessmentRef.current;
    if (!assessmentEl) return;

    const scrollContainer = assessmentEl.closest("main");
    if (!(scrollContainer instanceof HTMLElement)) {
      assessmentEl.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const assessmentRect = assessmentEl.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    const targetTop = scrollContainer.scrollTop + (assessmentRect.top - containerRect.top) - 8;
    scrollContainer.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  }, []);
  useEffect(() => {
    if (!assessmentPatient) return;
    const timeout = setTimeout(() => {
      scrollToAssessmentTop();
    }, 0);
    return () => clearTimeout(timeout);
  }, [assessmentPatient, scrollToAssessmentTop]);
  const statsFallback: PatientStats = {
    totalPatients: 0,
    newThisMonth: 0,
    withContactInfo: 0,
    withoutContactInfo: 0
  };
  const specialtyClinicScope = isSuperAdmin && selectedClinicId !== "all" ? selectedClinicId : undefined;

  const clinicsQuery = useQuery({
    queryKey: ["clinics", "for-filter"],
    queryFn: () => clinicService.list(),
    enabled: isSuperAdmin
  });

  const patientsQuery = useQuery({
    queryKey: ["patients", { page: 1, pageSize: 500, clinicId: selectedClinicId }],
    queryFn: () => patientService.list(selectedClinicId === "all" ? undefined : selectedClinicId)
  });

  const statsQuery = useQuery({
    queryKey: ["patients", "stats", selectedClinicId],
    queryFn: () => patientService.stats(selectedClinicId === "all" ? undefined : selectedClinicId)
  });

  const andrologyTemplateQuery = useQuery({
    queryKey: ["patients", "specialty", "andrology", "template", assessmentPatient?.id, specialtyClinicScope],
    queryFn: () =>
      specialtyService.getPatientSpecialtyTemplate(
        String(assessmentPatient?.id),
        "ANDROLOGY",
        specialtyClinicScope
      ),
    enabled: Boolean(assessmentPatient) && (!isSuperAdmin || selectedClinicId !== "all")
  });

  const andrologyAssessmentQuery = useQuery({
    queryKey: ["patients", "specialty", "andrology", "assessment", assessmentPatient?.id, specialtyClinicScope],
    queryFn: () =>
      specialtyService.getPatientSpecialtyAssessment(
        String(assessmentPatient?.id),
        "ANDROLOGY",
        specialtyClinicScope
      ),
    enabled: Boolean(assessmentPatient) && (!isSuperAdmin || selectedClinicId !== "all")
  });

  const rows: PatientRow[] =
    patientsQuery.data?.map((item) => ({
      id: item.id,
      name: item.fullName,
      nationalId: item.nationalId ?? null,
      phone: item.phone,
      whatsapp: item.whatsapp ?? "-",
      fileNumber: item.fileNumber,
      age: item.age ?? null,
      profession: item.profession,
      professionOther: item.professionOther ?? null,
      leadSource: item.leadSource,
      leadSourceOther: item.leadSourceOther ?? null,
      dateOfBirth: item.dateOfBirth ?? null,
      address: item.address ?? null,
      clinicName: item.clinic?.name,
      lastVisit: item.lastVisitAt ? String(item.lastVisitAt).slice(0, 10) : "-",
    })) ?? [];

  const stats = statsQuery.data ?? statsFallback;
  const loading = patientsQuery.isLoading || statsQuery.isLoading;
  const getProfessionLabel = useCallback(
    (row: PatientRow) =>
      row.profession === "OTHER"
        ? row.professionOther || t("patients.profession.OTHER")
        : t(`patients.profession.${row.profession}`),
    [t]
  );
  const getLeadSourceLabel = useCallback(
    (row: PatientRow) =>
      row.leadSource === "OTHER"
        ? row.leadSourceOther || t("patients.leadSource.OTHER")
        : t(`patients.leadSource.${row.leadSource}`),
    [t]
  );

  const createMutation = useMutation({
    mutationFn: patientService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success(t("patients.profileSaved"));
    },
    onError: () => {
      toast.error("Unable to save patient");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof patientService.update>[1] }) =>
      patientService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Patient updated");
    },
    onError: () => {
      toast.error("Unable to save patient");
    }
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => patientService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Patient deleted");
    },
    onError: () => {
      toast.error("Unable to delete patient");
    }
  });

  const saveAssessmentMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => {
      if (!assessmentPatient) {
        throw new Error("No selected patient");
      }
      return specialtyService.savePatientSpecialtyAssessment(
        assessmentPatient.id,
        "ANDROLOGY",
        values,
        specialtyClinicScope
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["patients", "specialty", "andrology", "assessment", assessmentPatient?.id, specialtyClinicScope]
      });
      toast.success(t("patients.assessment.saved"));
    },
    onError: () => {
      toast.error(t("patients.assessment.saveFailed"));
    }
  });

  const columns: ColumnDef<PatientRow>[] = useMemo(
    () => [
      { header: t("nav.patients"), accessorKey: "name" },
      { header: "File #", accessorKey: "fileNumber" },
      { header: t("field.nationalId"), accessorKey: "nationalId" },
      { header: t("field.phone"), accessorKey: "phone" },
      { header: "WhatsApp", accessorKey: "whatsapp" },
      { header: "Age", accessorKey: "age" },
      {
        header: t("field.profession"),
        id: "profession",
        cell: ({ row }) => <span>{getProfessionLabel(row.original)}</span>
      },
      {
        header: t("field.leadSource"),
        id: "leadSource",
        cell: ({ row }) => <span>{getLeadSourceLabel(row.original)}</span>
      },
      { header: t("patients.lastVisit"), accessorKey: "lastVisit" },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700 transition hover:bg-cyan-100"
              onClick={() => {
                setEditing(row.original);
                setFormExpanded(true);
                setTimeout(scrollToFormTop, 0);
              }}
            >
              <SquarePen size={12} />
              Edit
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-100"
              onClick={() => {
                if (isSuperAdmin && selectedClinicId === "all") {
                  toast.error(t("patients.assessment.selectClinicScope"));
                  return;
                }
                setAssessmentPatient(row.original);
              }}
            >
              <ClipboardList size={12} />
              {t("patients.assessment.open")}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        )
      }
    ],
    [getLeadSourceLabel, getProfessionLabel, isSuperAdmin, scrollToFormTop, selectedClinicId, t]
  );

  const handleSubmit = async (values: PatientFormValues) => {
    try {
      const payload = {
        fullName: values.fullName.trim(),
        nationalId: values.nationalId?.trim() || undefined,
        phone: values.phone.trim(),
        whatsapp: values.whatsapp || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        profession: values.profession,
        professionOther: values.professionOther || undefined,
        leadSource: values.leadSource,
        leadSourceOther: values.leadSourceOther || undefined,
        address: values.address || undefined
      };

      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      setEditing(null);
    } catch {
      toast.error("Unable to save patient");
    }
  };

  const patientFormExpander = formExpanded ? (
    <section
      ref={formRef}
      className="mt-2 overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-orange-50/35 to-sky-50/30 shadow-premium"
    >
      <div className="sticky top-0 z-20 border-b border-white/80 bg-white/90 p-4 shadow-sm backdrop-blur-2xl">
        <h3 className="text-lg font-semibold text-brand-navy">  
          {editing ? t("patients.updatePatient") : t("patients.newPatient")}
        </h3>
      </div>
      <div className="p-6">
        <PatientForm
          key={editing?.id ?? "new-patient"}
          initialValues={
            editing
              ? {
                  fullName: editing.name,
                  nationalId: editing.nationalId ?? "",
                  phone: editing.phone === "-" ? "" : editing.phone,
                  whatsapp: editing.whatsapp === "-" ? "" : editing.whatsapp,
                  profession:
                    ([
                      "ADMIN_EMPLOYEE",
                      "FREELANCER",
                      "DRIVER",
                      "ENGINEER",
                      "FACTORY_WORKER",
                      "OTHER"
                    ].includes(editing.profession)
                      ? editing.profession
                      : "ADMIN_EMPLOYEE") as PatientFormValues["profession"],
                  leadSource:
                    (["FACEBOOK_AD", "GOOGLE_SEARCH", "DOCTOR_REFERRAL", "FRIEND", "OTHER"].includes(editing.leadSource)
                      ? editing.leadSource
                      : "GOOGLE_SEARCH") as PatientFormValues["leadSource"],
                  leadSourceOther: editing.leadSourceOther ?? "",
                  dateOfBirth: editing.dateOfBirth ? String(editing.dateOfBirth).slice(0, 10) : "",
                  professionOther: editing.professionOther ?? "",
                  address: editing.address ?? ""
                }
              : undefined
          }
          submitLabel={editing ? t("patients.updatePatient") : undefined}
          onSubmit={async (values) => {
            await handleSubmit(values);
            setFormExpanded(false);
            setEditing(null);
          }}
        />
        <div className="mt-3">
          <button
            type="button"
            className="text-sm text-slate-500 transition hover:text-slate-700"
            onClick={() => {
              setFormExpanded(false);
              setEditing(null);
            }}
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </section>
  ) : null;

  const assessmentExpander = assessmentPatient ? (
    <section
      ref={assessmentRef}
      className="mt-2 overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-amber-50/35 to-orange-50/40 shadow-premium"
    >
      <div className="sticky top-0 z-20 border-b border-white/80 bg-white/90 p-4 shadow-sm backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-brand-navy">
              {t("patients.assessment.title")} - {assessmentPatient.name}
            </h3>
            <p className="text-xs text-slate-500">{t("patients.assessment.subtitle")}</p>
          </div>
          <button
            type="button"
            className="text-sm text-slate-500 transition hover:text-slate-700"
            onClick={() => setAssessmentPatient(null)}
          >
            {t("common.close")}
          </button>
        </div>
      </div>
      <div className="space-y-4 p-6">
        {andrologyTemplateQuery.isLoading || andrologyAssessmentQuery.isLoading ? (
          <p className="text-sm text-slate-500">{t("common.loading")}</p>
        ) : andrologyTemplateQuery.data?.template ? (
          <>
            <SpecialtyAssessmentForm
              key={`${assessmentPatient.id}-${andrologyAssessmentQuery.data?.assessment?.updatedAt ?? "new"}`}
              template={andrologyTemplateQuery.data.template}
              initialValues={andrologyAssessmentQuery.data?.assessment?.values as Record<string, unknown> | undefined}
              isSubmitting={saveAssessmentMutation.isPending}
              onSubmit={async (values) => {
                await saveAssessmentMutation.mutateAsync(values);
              }}
            />
            {Array.isArray(andrologyAssessmentQuery.data?.assessment?.alerts) && andrologyAssessmentQuery.data?.assessment?.alerts?.length ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3">
                <p className="mb-2 text-sm font-semibold text-amber-800">{t("patients.assessment.alerts")}</p>
                <ul className="list-disc space-y-1 ps-5 text-sm text-amber-900">
                  {andrologyAssessmentQuery.data.assessment.alerts.map((alert, index) => (
                    <li key={`${String(alert.key ?? "alert")}-${index}`}>
                      {String(alert.messageAr ?? alert.message ?? alert.nameAr ?? alert.name ?? "-")}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {Array.isArray(andrologyAssessmentQuery.data?.assessment?.diagnoses) && andrologyAssessmentQuery.data?.assessment?.diagnoses?.length ? (
              <div className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-3">
                <p className="mb-2 text-sm font-semibold text-cyan-800">{t("patients.assessment.diagnoses")}</p>
                <ul className="list-disc space-y-1 ps-5 text-sm text-cyan-900">
                  {andrologyAssessmentQuery.data.assessment.diagnoses.map((diagnosis, index) => (
                    <li key={`${String(diagnosis.key ?? "diag")}-${index}`}>
                      {String(diagnosis.nameAr ?? diagnosis.name ?? "-")}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-rose-600">{t("patients.assessment.templateUnavailable")}</p>
        )}
      </div>
    </section>
  ) : null;

  return (
    <RoleGate requiredPermissions={["patients.read"]} fallback={<div className="card p-6 text-sm text-slate-500">{t("common.notAllowed")}</div>}>
    <AppShell>
      {isSuperAdmin ? (
        <section className="mb-4 card bg-white/80 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-600">Clinic Scope</p>
            <select
              className="h-11 min-w-[220px] rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
              value={selectedClinicId}
              onChange={(event) => setSelectedClinicId(event.target.value)}
            >
              <option value="all">{t("patients.allClinics")}</option>
              {(clinicsQuery.data ?? []).map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
          </div>
        </section>
      ) : null}
      <section className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t("dashboard.totalPatients")}
          value={stats.totalPatients}
          icon={<Users size={17} />}
          gradientClassName="bg-gradient-to-br from-cyan-50 via-white to-sky-100"
          iconClassName="bg-cyan-500"
        />
        <StatCard
          title={t("patients.newThisMonth")}
          value={stats.newThisMonth}
          icon={<UserPlus size={17} />}
          gradientClassName="bg-gradient-to-br from-violet-50 via-white to-fuchsia-100"
          iconClassName="bg-violet-500"
        />
        <StatCard
          title={t("patients.withContact")}
          value={stats.withContactInfo}
          icon={<PhoneCall size={17} />}
          gradientClassName="bg-gradient-to-br from-emerald-50 via-white to-teal-100"
          iconClassName="bg-emerald-500"
        />
        <StatCard
          title={t("patients.missingContact")}
          value={stats.withoutContactInfo}
          icon={<PhoneOff size={17} />}
          gradientClassName="bg-gradient-to-br from-amber-50 via-white to-orange-100"
          iconClassName="bg-orange-500"
        />
      </section>
      <Suspense fallback={<div className="card p-6 text-sm text-slate-500">{t("patients.loading")}</div>}>
        {loading ? (
          <div className="card p-6 text-sm text-slate-500">{t("patients.loading")}</div>
        ) : (
          <EntityCollectionView
            title={t("nav.patients")}
            columns={columns}
            data={rows}
            storageKey="patient-view"
            belowHeader={
              <>
                {patientFormExpander}
                {assessmentExpander}
              </>
            }
            statusOptions={[
              { label: t("patients.allRecords"), value: "all" },
              { label: t("patients.leadSource.FACEBOOK_AD"), value: "FACEBOOK_AD" },
              { label: t("patients.leadSource.GOOGLE_SEARCH"), value: "GOOGLE_SEARCH" },
              { label: t("patients.leadSource.DOCTOR_REFERRAL"), value: "DOCTOR_REFERRAL" },
              { label: t("patients.leadSource.FRIEND"), value: "FRIEND" },
              { label: t("patients.leadSource.OTHER"), value: "OTHER" }
            ]}
            searchPlaceholder={`${t("common.search")} ${t("nav.patients")}`}
            addButton={
              <RippleButton
                onClick={() => {
                  setEditing(null);
                  setFormExpanded((prev) => !prev);
                }}
              >
                {formExpanded ? t("common.close") : `+ ${t("nav.patients")}`}
              </RippleButton>
            }
            getSearchText={(row) =>
              `${row.name} ${row.nationalId ?? ""} ${row.phone} ${row.whatsapp} ${row.fileNumber} ${row.profession} ${row.leadSource}`
            }
            getStatus={(row) => row.leadSource}
            getDate={(row) => row.lastVisit}
            renderCard={(row) => (
              <div className="relative overflow-hidden rounded-2xl border border-orange-100/70 bg-gradient-to-br from-white via-orange-50/40 to-cyan-50/30 p-4">
                <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-orange-200/30 blur-xl" />
                <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-cyan-200/20 blur-xl" />
                <div className="relative space-y-3">
                  {(() => {
                    const isExpanded = expandedCardId === row.id;
                    return (
                      <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-slate-900">{row.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2 py-0.5 font-semibold text-cyan-700">
                          <ClipboardList size={12} />
                          {t("patients.card.fileNumber")}: {row.fileNumber}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-700">
                          {t("field.nationalId")}: {row.nationalId || t("patients.card.notSet")}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 font-semibold text-orange-700">
                          <MapPin size={12} />
                          {row.clinicName ?? t("patients.card.notSet")}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-blue-500 p-2 text-white shadow-soft">
                      <User size={14} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-orange-600">{t("patients.lastVisit")}: {row.lastVisit}</p>
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                      {getLeadSourceLabel(row)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white/85 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    onClick={() => setExpandedCardId((prev) => (prev === row.id ? null : row.id))}
                  >
                    <ChevronDown size={14} className={cn("transition-transform", isExpanded && "rotate-180")} />
                    {isExpanded ? t("patients.card.hideDetails") : t("patients.card.viewDetails")}
                  </button>

                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-out",
                      isExpanded ? "mt-1 max-h-[1200px] opacity-100 pointer-events-auto" : "max-h-0 opacity-0 pointer-events-none"
                    )}
                  >
                    <div className={cn("space-y-3", isExpanded && "pt-2")}>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-xl bg-white/90 p-2">
                            <p className="text-slate-500">{t("patients.card.phone")}</p>
                            <p className="mt-0.5 inline-flex items-center gap-1 font-semibold text-slate-800">
                              <PhoneOutgoing size={12} className="text-cyan-600" />
                              {row.phone || t("patients.card.notSet")}
                            </p>
                          </div>
                          <div className="rounded-xl bg-white/90 p-2">
                            <p className="text-slate-500">{t("patients.card.whatsapp")}</p>
                            <p className="mt-0.5 font-semibold text-slate-800">{row.whatsapp || t("patients.card.notSet")}</p>
                          </div>
                          <div className="rounded-xl bg-white/90 p-2">
                            <p className="text-slate-500">{t("patients.card.age")}</p>
                            <p className="mt-0.5 font-semibold text-slate-800">{row.age ?? t("patients.card.notSet")}</p>
                          </div>
                          <div className="rounded-xl bg-white/90 p-2">
                            <p className="text-slate-500">{t("patients.card.birthDate")}</p>
                            <p className="mt-0.5 inline-flex items-center gap-1 font-semibold text-slate-800">
                              <Calendar size={12} className="text-orange-600" />
                              {row.dateOfBirth ? String(row.dateOfBirth).slice(0, 10) : t("patients.card.notSet")}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl bg-white/90 p-2 text-xs">
                          <p className="text-slate-500">{t("patients.card.profession")}</p>
                          <p className="mt-0.5 font-semibold text-slate-800">{getProfessionLabel(row)}</p>
                        </div>

                        <div className="rounded-xl bg-white/90 p-2 text-xs">
                          <p className="text-slate-500">{t("patients.card.leadSource")}</p>
                          <p className="mt-0.5 font-semibold text-orange-700">{getLeadSourceLabel(row)}</p>
                        </div>

                        <div className="rounded-xl bg-white/90 p-2 text-xs">
                          <p className="text-slate-500">{t("patients.card.address")}</p>
                          <p className="mt-0.5 font-semibold text-slate-800">{row.address || t("patients.card.notSet")}</p>
                        </div>

                        <div className="pt-1">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700 transition hover:bg-cyan-100"
                              onClick={() => {
                                setEditing(row);
                                setFormExpanded(true);
                                setTimeout(scrollToFormTop, 0);
                              }}
                            >
                              <SquarePen size={12} />
                              Edit
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-100"
                              onClick={() => {
                                if (isSuperAdmin && selectedClinicId === "all") {
                                  toast.error(t("patients.assessment.selectClinicScope"));
                                  return;
                                }
                                setAssessmentPatient(row);
                              }}
                            >
                              <ClipboardList size={12} />
                              {t("patients.assessment.open")}
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                              onClick={() => setDeleteTarget(row)}
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                  </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          />
        )}
      </Suspense>
      {deleteTarget ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={t("patients.deleteConfirm.closeAria")}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
            disabled={removeMutation.isPending}
          />
          <section className="relative w-full max-w-xl rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 via-orange-50 to-white p-5 shadow-premium">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-rose-100 p-2 text-rose-600">
                  <TriangleAlert size={18} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">{t("patients.deleteConfirm.title")}</p>
                  <p className="text-sm text-slate-600">
                    {t("patients.deleteConfirm.description", { name: deleteTarget.name })}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => setDeleteTarget(null)}
                  disabled={removeMutation.isPending}
                >
                  {t("patients.deleteConfirm.cancel")}
                </button>
                <RippleButton
                  type="button"
                  className="from-rose-600 to-red-500 hover:shadow-rose-500/30"
                  onClick={async () => {
                    if (!deleteTarget) return;
                    await removeMutation.mutateAsync(deleteTarget.id);
                    setDeleteTarget(null);
                  }}
                  disabled={removeMutation.isPending}
                >
                  {removeMutation.isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      {t("patients.deleteConfirm.deleting")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Trash2 size={14} />
                      {t("patients.deleteConfirm.confirm")}
                    </span>
                  )}
                </RippleButton>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </AppShell>
    </RoleGate>
  );
}
