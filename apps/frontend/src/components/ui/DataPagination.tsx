"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/i18n-provider";

interface DataPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const sizes = [10, 20, 50, 100];

export function DataPagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange
}: DataPaginationProps) {
  const { t } = useI18n();
  const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1).slice(
    Math.max(0, page - 3),
    Math.max(5, page + 2)
  );

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-slate-600">
        {t("collection.showing")} <span className="font-semibold text-slate-900">{Math.min((page - 1) * pageSize + 1, total)}</span>-
        <span className="font-semibold text-slate-900">{Math.min(page * pageSize, total)}</span> {t("collection.of")}{" "}
        <span className="font-semibold text-slate-900">{total}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-sm outline-none ring-orange-400 focus:ring-2"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {sizes.map((size) => (
            <option key={size} value={size}>
              {size}
              {t("collection.perPage")}
            </option>
          ))}
        </select>

        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-orange-50 disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p) => (
            <motion.button
              key={p}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "h-9 min-w-9 rounded-xl px-2 text-sm transition",
                p === page
                  ? "bg-orange-500 text-white shadow-md"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-orange-50"
              )}
              onClick={() => onPageChange(p)}
            >
              {p}
            </motion.button>
          ))}
        </div>

        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-orange-50 disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
