"use client";

import { LayoutGrid, Table2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/i18n-provider";

interface ViewToggleProps {
  value: "table" | "cards";
  storageKey: string;
  onChange: (view: "table" | "cards") => void;
}

export function ViewToggle({ value, onChange, storageKey }: ViewToggleProps) {
  const { t } = useI18n();

  const setView = (view: "table" | "cards") => {
    localStorage.setItem(storageKey, view);
    onChange(view);
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
      {[
        { id: "table" as const, icon: Table2, label: t("collection.table") },
        { id: "cards" as const, icon: LayoutGrid, label: t("collection.cards") }
      ].map((item) => {
        const Icon = item.icon;
        const active = value === item.id;
        return (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => setView(item.id)}
            className={cn(
              "inline-flex h-9 items-center gap-1 rounded-lg px-3 text-sm transition",
              active ? "bg-orange-500 text-white shadow-sm" : "text-slate-600 hover:bg-orange-50"
            )}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{item.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
