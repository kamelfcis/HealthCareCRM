"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { RippleButton } from "@/components/ui/ripple-button";
import { useI18n } from "@/components/providers/i18n-provider";
import type { SpecialtyTemplate } from "@/lib/specialty-service";

interface SpecialtyAssessmentFormProps {
  template: SpecialtyTemplate;
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;
  isSubmitting?: boolean;
  submitLabel?: string;
  hideSubmitActions?: boolean;
}

type Values = Record<string, unknown>;

const isVisible = (field: SpecialtyTemplate["fields"][number], values: Values) => {
  const condition = field.visibleWhen as { field?: string; equals?: unknown } | null | undefined;
  if (!condition?.field) return true;
  return values[condition.field] === condition.equals;
};

export function SpecialtyAssessmentForm({
  template,
  initialValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  hideSubmitActions
}: SpecialtyAssessmentFormProps) {
  const { locale, t } = useI18n();
  const { register, handleSubmit, setValue, watch } = useForm<Values>({
    defaultValues: initialValues ?? {}
  });

  const values = watch();
  const groupedSections = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        title: string;
        fields: SpecialtyTemplate["fields"];
      }
    >();

    for (const field of template.fields) {
      const id = field.section;
      const title = locale === "ar" ? field.sectionAr : field.section;
      const existing = map.get(id);
      if (!existing) {
        map.set(id, { id, title, fields: [field] });
      } else {
        existing.fields.push(field);
      }
    }

    return Array.from(map.values());
  }, [template.fields, locale]);
  const [activeSectionId, setActiveSectionId] = useState<string>("");

  useEffect(() => {
    if (!groupedSections.length) {
      setActiveSectionId("");
      return;
    }

    const exists = groupedSections.some((section) => section.id === activeSectionId);
    if (!exists) {
      setActiveSectionId(groupedSections[0].id);
    }
  }, [groupedSections, activeSectionId]);

  const activeSection = groupedSections.find((section) => section.id === activeSectionId) ?? groupedSections[0];
  const activeIndex = groupedSections.findIndex((section) => section.id === activeSection?.id);
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex >= 0 && activeIndex < groupedSections.length - 1;
  const goPrev = () => {
    if (!hasPrev) return;
    const prevSection = groupedSections[activeIndex - 1];
    if (!prevSection) return;
    setActiveSectionId(prevSection.id);
  };

  const goNext = () => {
    if (!hasNext) return;
    const nextSection = groupedSections[activeIndex + 1];
    if (!nextSection) return;
    setActiveSectionId(nextSection.id);
  };

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit(async (submittedValues) => {
        await onSubmit(submittedValues);
      })}
    >
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/85 p-2">
        <div className="flex min-w-max gap-2">
          {groupedSections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={
                section.id === activeSectionId
                  ? "rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm"
                  : "rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-orange-300 hover:text-orange-700"
              }
              onClick={() => setActiveSectionId(section.id)}
              disabled={Boolean(isSubmitting)}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2">
        <p className="text-sm font-medium text-slate-600">
          {locale === "ar" ? "التقدم" : "Progress"}: {activeIndex >= 0 ? activeIndex + 1 : 0} / {groupedSections.length}
        </p>
      </div>

      {activeSection ? (
        <section key={activeSection.id} className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4">
          <h4 className="text-sm font-semibold text-slate-800">{activeSection.title}</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {activeSection.fields.map((field) => {
              if (!isVisible(field, values)) {
                return null;
              }

              const label = locale === "ar" ? field.labelAr : field.label;
              const help = locale === "ar" ? field.helpTextAr : field.helpText;
              if (field.fieldType === "AUTO") {
                return (
                  <div key={field.id} className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">{label}</label>
                    <input
                      value={String(values[field.key] ?? "")}
                      readOnly
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700"
                    />
                  </div>
                );
              }

              if (field.fieldType === "YES_NO") {
                return (
                  <div key={field.id} className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">{label}</label>
                    <select
                      {...register(field.key)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-orange-500"
                    >
                      <option value="">-</option>
                      <option value="YES">{locale === "ar" ? "نعم" : "Yes"}</option>
                      <option value="NO">{locale === "ar" ? "لا" : "No"}</option>
                    </select>
                    {help ? <p className="text-[11px] text-slate-500">{help}</p> : null}
                  </div>
                );
              }

              if (field.fieldType === "DROPDOWN") {
                return (
                  <div key={field.id} className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">{label}</label>
                    <select
                      {...register(field.key)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-orange-500"
                    >
                      <option value="">-</option>
                      {field.options.map((option) => (
                        <option key={option.id} value={option.value}>
                          {locale === "ar" ? option.labelAr : option.label}
                        </option>
                      ))}
                    </select>
                    {help ? <p className="text-[11px] text-slate-500">{help}</p> : null}
                  </div>
                );
              }

              if (field.fieldType === "MULTI_SELECT") {
                const selected = Array.isArray(values[field.key]) ? (values[field.key] as string[]) : [];
                return (
                  <div key={field.id} className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">{label}</label>
                    <div className="grid gap-1 rounded-xl border border-slate-200 bg-white p-2">
                      {field.options.map((option) => {
                        const checked = selected.includes(option.value);
                        return (
                          <label key={option.id} className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(event) => {
                                const next = event.target.checked
                                  ? [...selected, option.value]
                                  : selected.filter((item) => item !== option.value);
                                setValue(field.key, next);
                              }}
                            />
                            <span>{locale === "ar" ? option.labelAr : option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                    {help ? <p className="text-[11px] text-slate-500">{help}</p> : null}
                  </div>
                );
              }

              const type = field.fieldType === "DATE" ? "date" : field.fieldType === "NUMBER" ? "number" : "text";
              return (
                <div key={field.id} className="space-y-1">
                  <label className="text-sm font-medium text-slate-600">{label}</label>
                  <input
                    type={type}
                    step={type === "number" ? "any" : undefined}
                    {...register(field.key)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-orange-500"
                  />
                  {help ? <p className="text-[11px] text-slate-500">{help}</p> : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
      {!hideSubmitActions ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:border-orange-300 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={goPrev}
              disabled={!hasPrev || Boolean(isSubmitting)}
            >
              {locale === "ar" ? "السابق" : "Previous"}
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:border-orange-300 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={goNext}
              disabled={!hasNext || Boolean(isSubmitting)}
            >
              {locale === "ar" ? "التالي" : "Next"}
            </button>
          </div>
          <RippleButton type="submit" disabled={Boolean(isSubmitting)}>
            {isSubmitting ? t("patients.assessment.saving") : submitLabel ?? t("patients.assessment.save")}
          </RippleButton>
        </div>
      ) : null}
    </form>
  );
}
