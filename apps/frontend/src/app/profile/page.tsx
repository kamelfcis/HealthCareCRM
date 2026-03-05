"use client";

import { AppShell } from "@/components/layout/app-shell";
import { storage } from "@/lib/storage";
import { useI18n } from "@/components/providers/i18n-provider";

export default function ProfilePage() {
  const { t } = useI18n();
  const user = storage.getUser();

  return (
    <AppShell>
      <section className="card bg-white/80 p-6">
        <h1 className="text-2xl font-semibold text-brand-navy">{t("common.profile")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("common.account")}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">{t("field.firstName")}</p>
            <p className="mt-1 font-medium text-slate-800">{user?.firstName ?? "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">{t("field.lastName")}</p>
            <p className="mt-1 font-medium text-slate-800">{user?.lastName ?? "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">{t("field.email")}</p>
            <p className="mt-1 font-medium text-slate-800">{user?.email ?? "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">{t("field.role")}</p>
            <p className="mt-1 font-medium text-slate-800">{user?.role ?? "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:col-span-2">
            <p className="text-xs text-slate-500">Clinic ID</p>
            <p className="mt-1 font-medium text-slate-800">{user?.clinicId ?? "-"}</p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
