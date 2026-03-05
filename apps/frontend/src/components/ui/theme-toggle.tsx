"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/i18n-provider";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useI18n();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-slate-200/90 bg-white/90 p-1 shadow-soft backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/80",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-label={t("theme.light")}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs transition sm:px-3 sm:text-sm",
          !isDark ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md" : "text-slate-600 hover:bg-orange-50 dark:text-slate-200 dark:hover:bg-slate-800"
        )}
      >
        <Sun size={14} />
        <span className="hidden sm:inline">{t("theme.light")}</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-label={t("theme.dark")}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs transition sm:px-3 sm:text-sm",
          isDark ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md" : "text-slate-600 hover:bg-orange-50 dark:text-slate-200 dark:hover:bg-slate-800"
        )}
      >
        <Moon size={14} />
        <span className="hidden sm:inline">{t("theme.dark")}</span>
      </button>
    </div>
  );
}
