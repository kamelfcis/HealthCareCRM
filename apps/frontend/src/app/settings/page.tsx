"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { useI18n } from "@/components/providers/i18n-provider";
import { FloatingInput } from "@/components/ui/floating-input";
import { RippleButton } from "@/components/ui/ripple-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { clinicService } from "@/lib/clinic-service";
import { storage } from "@/lib/storage";

export default function SettingsPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [clinicImageFile, setClinicImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    timezone: ""
  });
  const user = storage.getUser();
  const isClinicAdmin = user?.role === "ClinicAdmin";

  const clinicQuery = useQuery({
    queryKey: ["settings", "clinic-me"],
    queryFn: () => clinicService.getMyClinic(),
    enabled: isClinicAdmin
  });

  const clinicImagePath = clinicQuery.data?.imageUrl ?? null;
  const apiOrigin = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api").replace(/\/api\/?$/, "");
  const clinicImageSrc =
    clinicImagePath && clinicImagePath.startsWith("http") ? clinicImagePath : clinicImagePath ? `${apiOrigin}${clinicImagePath}` : null;
  const previewUrl = useMemo(() => (clinicImageFile ? URL.createObjectURL(clinicImageFile) : clinicImageSrc), [clinicImageFile, clinicImageSrc]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      data.append("name", form.name);
      data.append("slug", form.slug);
      data.append("email", form.email);
      data.append("phone", form.phone);
      data.append("address", form.address);
      data.append("city", form.city);
      data.append("country", form.country);
      data.append("timezone", form.timezone);
      if (clinicImageFile) {
        data.append("clinicImage", clinicImageFile);
      }
      return clinicService.updateMyClinic(data);
    },
    onSuccess: () => {
      toast.success(t("settings.updated"));
      void queryClient.invalidateQueries({ queryKey: ["settings", "clinic-me"] });
      void queryClient.invalidateQueries({ queryKey: ["top-navbar", "clinics"] });
      void queryClient.invalidateQueries({ queryKey: ["clinics", "for-filter"] });
      setClinicImageFile(null);
    },
    onError: () => {
      toast.error(t("settings.updateFailed"));
    }
  });

  useEffect(() => {
    if (clinicQuery.data) {
      setForm({
        name: clinicQuery.data.name ?? "",
        slug: clinicQuery.data.slug ?? "",
        email: clinicQuery.data.email ?? "",
        phone: clinicQuery.data.phone ?? "",
        address: clinicQuery.data.address ?? "",
        city: clinicQuery.data.city ?? "",
        country: clinicQuery.data.country ?? "",
        timezone: clinicQuery.data.timezone ?? ""
      });
    }
  }, [clinicQuery.data]);

  return (
    <AppShell>
      <div className="card p-6 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-brand-navy dark:text-slate-100">{t("settings.title")}</h1>
          <ThemeToggle />
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t("settings.body")}
        </p>
        {!isClinicAdmin ? <p className="mt-6 text-sm text-slate-500">{t("common.notAllowed")}</p> : null}
        {isClinicAdmin ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              await saveMutation.mutateAsync();
            }}
          >
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">{t("settings.clinicImage")}</p>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                  {previewUrl ? (
                    <Image src={previewUrl} alt="Clinic" width={80} height={80} unoptimized className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">{t("settings.noImage")}</div>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={(event) => setClinicImageFile(event.target.files?.[0] ?? null)} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <FloatingInput id="settings-name" label={t("settings.clinicName")} value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required />
              <FloatingInput id="settings-slug" label={t("settings.slug")} value={form.slug} onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))} required />
              <FloatingInput id="settings-email" label={t("field.email")} type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
              <FloatingInput id="settings-phone" label={t("field.phone")} value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
              <FloatingInput id="settings-city" label={t("settings.city")} value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))} />
              <FloatingInput id="settings-country" label={t("settings.country")} value={form.country} onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))} />
              <FloatingInput id="settings-timezone" label={t("settings.timezone")} value={form.timezone} onChange={(event) => setForm((prev) => ({ ...prev, timezone: event.target.value }))} />
              <FloatingInput id="settings-address" label={t("field.address")} value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />
            </div>
            <RippleButton type="submit" className="h-11" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? t("settings.saving") : t("settings.save")}
            </RippleButton>
          </form>
        ) : null}
      </div>
    </AppShell>
  );
}
