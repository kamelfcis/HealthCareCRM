"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/i18n-provider";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { locale, setLocale, t } = useI18n();

  const items = [
    { id: "en" as const, label: t("common.language.english"), flagSrc: "/flags/uk.svg" },
    { id: "ar" as const, label: t("common.language.arabic"), flagSrc: "/flags/egypt.svg" }
  ];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-slate-200/90 bg-white/90 p-1 shadow-soft backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/80",
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setLocale(item.id)}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs transition sm:px-3 sm:text-sm",
            locale === item.id
              ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md"
              : "text-slate-600 hover:bg-orange-50 dark:text-slate-200 dark:hover:bg-slate-800"
          )}
          aria-label={item.label}
          type="button"
        >
          <span className="inline-flex h-4 w-4 overflow-hidden rounded-full ring-1 ring-white/80">
            <Image src={item.flagSrc} alt={item.label} width={16} height={16} className="h-4 w-4 object-cover" />
          </span>
          <span className="hidden sm:inline">{item.id.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
