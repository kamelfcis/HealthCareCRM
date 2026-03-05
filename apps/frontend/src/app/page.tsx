"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { useI18n } from "@/components/providers/i18n-provider";

export default function Home() {
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    const user = storage.getUser();
    router.replace(user ? "/dashboard" : "/login");
  }, [router]);

  return <div className="flex min-h-screen items-center justify-center text-brand-navy">{t("common.loading")}</div>;
}
