"use client";

import { useTranslations } from "next-intl";
import { Check, Clock, ChefHat, HardHat, Minus, Plus, Sparkles, Truck, type LucideIcon } from "lucide-react";
import { Flag } from "@/components/ui/Flag";
import { Link } from "@/i18n/navigation";
import { COUNTRIES, TIMELINES, type Industry } from "@/lib/lead-schema";
import { cn } from "@/lib/cn";
import { Choice, FieldError, TextField, inputBase } from "./fields";
import type { FieldErrors, FormState } from "./form";

export const INDUSTRY_ICONS: Record<Industry, LucideIcon> = {
  hospitality: ChefHat,
  logistics: Truck,
  construction: HardHat,
  other: Sparkles,
};

type StepProps = {
  data: FormState;
  set: (patch: Partial<FormState>) => void;
  errors: FieldErrors;
};

/** Step heading: receives focus on step change (tabIndex -1). */
function Legend({ children }: { children: React.ReactNode }) {
  return (
    <legend
      data-step-heading
      tabIndex={-1}
      className="mb-6 font-display text-[clamp(1.375rem,1.1rem+0.9vw,1.75rem)] leading-tight font-semibold text-cream outline-none"
    >
      {children}
    </legend>
  );
}

export function StepIndustry({ data, set, onPicked }: StepProps & { onPicked: () => void }) {
  const t = useTranslations("Contact");
  const main: Industry[] = ["hospitality", "logistics", "construction"];
  const pick = (industry: Industry) => {
    // Changing industry clears positions that belonged to the previous one
    set({ industry, positions: industry === data.industry ? data.positions : [] });
    onPicked();
  };
  return (
    <fieldset>
      <Legend>{t("steps.industry.legend")}</Legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {main.map((key) => {
          const Icon = INDUSTRY_ICONS[key];
          const on = data.industry === key;
          return (
            <Choice
              key={key}
              type="radio"
              name="industry"
              value={key}
              checked={on}
              onChange={() => pick(key)}
              className="flex items-center gap-4 rounded-[20px] p-4 sm:flex-col sm:items-start sm:gap-6 sm:p-5"
            >
              <span
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-2xl transition-colors",
                  on ? "bg-brand text-ink" : "bg-white/[0.08] text-brand",
                )}
              >
                <Icon aria-hidden className="size-6" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[1.0625rem] leading-snug font-semibold text-cream">
                  {t(`industries.${key}`)}
                </span>
                <span className="mt-1 block text-[0.8125rem] text-muted-dark">{t(`industryHints.${key}`)}</span>
              </span>
              {on && (
                <span aria-hidden className="absolute top-3 right-3 grid size-6 place-items-center rounded-full bg-brand text-ink">
                  <Check className="size-3.5" />
                </span>
              )}
            </Choice>
          );
        })}
      </div>
      <Choice
        type="radio"
        name="industry"
        value="other"
        checked={data.industry === "other"}
        onChange={() => pick("other")}
        className="mt-3 inline-flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold"
      >
        <Sparkles aria-hidden className="size-4 text-brand" />
        {t("industries.other")}
        <span className="font-normal text-muted-dark">— {t("industryHints.other")}</span>
      </Choice>
    </fieldset>
  );
}

export function StepPositions({ data, set, errors }: StepProps) {
  const t = useTranslations("Contact");
  const ti = useTranslations("Industries");
  const list = data.industry && data.industry !== "other" ? (ti.raw(`items.${data.industry}.positions`) as string[]) : [];
  const toggle = (p: string) =>
    set({ positions: data.positions.includes(p) ? data.positions.filter((x) => x !== p) : [...data.positions, p] });
  const clamp = (n: number) => Math.min(100, Math.max(1, Number.isFinite(n) ? Math.round(n) : 1));

  return (
    <fieldset>
      <Legend>{t("steps.positions.legend")}</Legend>
      <p className="-mt-3 mb-4 text-sm text-muted-dark">{t("positionsHint")}</p>
      <div role="group" aria-describedby="positions-error" className="flex flex-wrap gap-2">
        {list.map((p) => (
          <Choice
            key={p}
            type="checkbox"
            name="positions"
            value={p}
            checked={data.positions.includes(p)}
            onChange={() => toggle(p)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium"
          >
            {data.positions.includes(p) && <Check aria-hidden className="size-3.5 text-brand" />}
            {p}
          </Choice>
        ))}
        <Choice
          type="checkbox"
          name="otherOn"
          value="other"
          checked={data.otherOn}
          onChange={() => set({ otherOn: !data.otherOn })}
          className="inline-flex items-center gap-1.5 border-dashed px-4 py-2 text-sm font-medium"
        >
          <Plus aria-hidden className={cn("size-3.5 transition-transform", data.otherOn && "rotate-45")} />
          {t("otherPosition")}
        </Choice>
      </div>
      {data.otherOn && (
        <div className="mt-3 max-w-sm">
          <label htmlFor="otherPosition" className="sr-only">
            {t("otherPosition")}
          </label>
          <input
            id="otherPosition"
            autoFocus
            value={data.otherPosition}
            onChange={(e) => set({ otherPosition: e.target.value })}
            placeholder={t("otherPositionPlaceholder")}
            className={cn(inputBase, "h-11")}
            maxLength={120}
          />
        </div>
      )}
      <FieldError id="positions-error" message={errors.positions ? t(`errors.${errors.positions}`) : undefined} />

      <div className="mt-8 grid gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:gap-10">
        <div>
          <label htmlFor="count" className="mb-2 block text-sm font-medium text-cream/85">
            {t("count")}
          </label>
          <div className="inline-flex items-center gap-1 rounded-full border border-white/[0.12] bg-white/[0.05] p-1">
            <button
              type="button"
              aria-label={t("decrease")}
              onClick={() => set({ count: clamp(data.count - 1) })}
              disabled={data.count <= 1}
              className="grid size-11 place-items-center rounded-full text-cream transition-colors hover:bg-white/10 disabled:opacity-30"
            >
              <Minus className="size-4" />
            </button>
            <input
              id="count"
              type="number"
              inputMode="numeric"
              min={1}
              max={100}
              value={data.count}
              onChange={(e) => set({ count: clamp(e.target.valueAsNumber) })}
              className="w-16 [appearance:textfield] bg-transparent text-center font-display text-2xl font-semibold text-cream tabular-nums outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-brand [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              aria-label={t("increase")}
              onClick={() => set({ count: clamp(data.count + 1) })}
              disabled={data.count >= 100}
              className="grid size-11 place-items-center rounded-full bg-brand text-ink transition-colors hover:bg-brand-hover disabled:opacity-30"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-cream/85">
            {t("country")} <span className="font-normal text-muted-dark">({t("optional")})</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map((c) => (
              <Choice
                key={c}
                type="radio"
                name="country"
                value={c}
                checked={data.country === c}
                onChange={() => set({ country: c })}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium"
              >
                {c !== "none" && <Flag code={c} />}
                {t(`countries.${c}`)}
              </Choice>
            ))}
          </div>
        </fieldset>
      </div>
    </fieldset>
  );
}

export function StepTimeline({ data, set }: StepProps) {
  const t = useTranslations("Contact");
  return (
    <fieldset>
      <Legend>{t("steps.timeline.legend")}</Legend>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {TIMELINES.map((key) => (
          <Choice
            key={key}
            type="radio"
            name="timeline"
            value={key}
            checked={data.timeline === key}
            onChange={() => set({ timeline: key })}
            className="flex items-center justify-between gap-3 rounded-2xl px-5 py-4 font-semibold"
          >
            {t(`timelines.${key}`)}
            <span
              aria-hidden
              className={cn(
                "grid size-5 place-items-center rounded-full border-2 transition-colors",
                data.timeline === key ? "border-brand bg-brand" : "border-white/30",
              )}
            >
              {data.timeline === key && <span className="size-1.5 rounded-full bg-ink" />}
            </span>
          </Choice>
        ))}
      </div>
      <div aria-live="polite" className="mt-5 min-h-[4.5rem]">
        {data.timeline && (
          <div
            className={cn(
              "flex gap-3 rounded-2xl border p-4 text-sm leading-relaxed",
              data.timeline === "asap"
                ? "border-brand/40 bg-brand/10 text-cream"
                : "border-emerald-400/25 bg-emerald-400/10 text-cream",
            )}
          >
            <Clock
              aria-hidden
              className={cn("mt-0.5 size-4 shrink-0", data.timeline === "asap" ? "text-brand" : "text-emerald-300")}
            />
            {t(data.timeline === "asap" ? "timelineHints.asap" : "timelineHints.other")}
          </div>
        )}
      </div>
    </fieldset>
  );
}

export function StepContact({
  data,
  set,
  errors,
  onBlurField,
}: StepProps & { onBlurField: (name: string) => void }) {
  const t = useTranslations("Contact");
  const err = (k: string) => (errors[k] ? t(`errors.${errors[k]}`) : undefined);
  const field = (name: "name" | "company" | "city" | "phone" | "email") => ({
    id: `lead-${name}`,
    name,
    value: data[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set({ [name]: e.target.value }),
    onBlur: () => onBlurField(name),
    error: err(name),
    requiredLabel: t("required"),
  });

  return (
    <fieldset>
      <Legend>{t("steps.contact.legend")}</Legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...field("name")} label={t("fields.name")} required autoComplete="name" />
        <TextField {...field("company")} label={t("fields.company")} required autoComplete="organization" />
        <TextField {...field("phone")} label={t("fields.phone")} required type="tel" autoComplete="tel" inputMode="tel" />
        <TextField {...field("email")} label={t("fields.email")} required type="email" autoComplete="email" />
        <TextField {...field("city")} label={t("fields.city")} autoComplete="address-level2" className="sm:col-span-2" />
        <TextField
          id="lead-message"
          name="message"
          multiline
          label={`${t("fields.message")} (${t("optional")})`}
          placeholder={t("fields.messagePlaceholder")}
          value={data.message}
          onChange={(e) => set({ message: e.target.value })}
          maxLength={2000}
          className="sm:col-span-2"
        />
      </div>

      {/* Honeypot — invisible to people, tempting to bots */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="lead-website">{t("fields.honeypot")}</label>
        <input
          id="lead-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={data.website}
          onChange={(e) => set({ website: e.target.value })}
        />
      </div>

      <div className="mt-5">
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-cream/85">
          <input
            type="checkbox"
            checked={data.consent}
            onChange={(e) => set({ consent: e.target.checked })}
            onBlur={() => onBlurField("consent")}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby="consent-error"
            required
            className="peer sr-only"
          />
          <span
            aria-hidden
            className={cn(
              "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-brand/40",
              data.consent ? "border-brand bg-brand text-ink" : "border-white/30",
            )}
          >
            {data.consent && <Check className="size-3.5" />}
          </span>
          <span>
            {t.rich("fields.consent", {
              link: (chunks) => (
                <Link href="/politika-privatnosti" prefetch={false} className="font-semibold text-cream underline underline-offset-2 hover:text-brand">
                  {chunks}
                </Link>
              ),
            })}
            <span className="ml-0.5 text-brand" aria-hidden>
              *
            </span>
          </span>
        </label>
        <FieldError id="consent-error" message={err("consent")} />
      </div>
    </fieldset>
  );
}
