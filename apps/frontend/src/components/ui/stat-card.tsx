"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  change?: string;
  icon?: React.ReactNode;
  gradientClassName?: string;
  iconClassName?: string;
}

export function StatCard({
  title,
  value,
  prefix = "",
  suffix = "",
  change,
  icon,
  gradientClassName,
  iconClassName
}: StatCardProps) {
  const numericValue = useMemo(() => {
    if (typeof value === "number") return value;
    const parsed = Number(String(value).replace(/[^\d.-]/g, ""));
    return Number.isNaN(parsed) ? null : parsed;
  }, [value]);

  const [count, setCount] = useState(0);

  useEffect(() => {
    if (numericValue === null) return;
    const duration = 900;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.round(numericValue * progress));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [numericValue]);

  const displayValue =
    numericValue === null ? String(value) : `${prefix}${count.toLocaleString()}${suffix}`;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`card p-5 hover:shadow-premium ${gradientClassName ?? "bg-gradient-to-br from-white to-orange-50/60"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-500">{title}</p>
        {icon ? (
          <div
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md ${iconClassName ?? "bg-orange-500"}`}
          >
            {icon}
          </div>
        ) : null}
      </div>
      <div className="mt-2 flex items-end justify-between">
        <h3 className="text-2xl font-semibold text-slate-900">{displayValue}</h3>
        {change ? <span className="text-xs text-brand-orange">{change}</span> : null}
      </div>
    </motion.div>
  );
}
