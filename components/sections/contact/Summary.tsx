"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { BadgeCheck, ChevronUp, Clock, ShieldCheck } from "lucide-react";
import { Flag } from "@/components/ui/Flag";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/animations";
import { cn } from "@/lib/cn";
import type { FormState } from "./form";
import { INDUSTRY_ICONS } from "./Steps";

/** Wraps a summary value and plays a small "pop" whenever `valueKey` changes. */
function Pop({ valueKey, children }: { valueKey: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useGSAP(
    () => {
      if (first.current) {
        first.current = false;
        return;
      }
      if (prefersReducedMotion()) return;
      gsap.fromTo(ref.current, { scale: 0.9, autoAlpha: 0.3 }, { scale: 1, autoAlpha: 1, duration: 0.45, ease: "back.out(2.2)" });
    },
    { dependencies: [valueKey], scope: ref },
  );
  return (
    <div ref={ref} className="origin-left">
      {children}
    </div>
  );
}

const Skeleton = ({ w = "w-28" }: { w?: string }) => (
  <span aria-hidden className={cn("block h-4 animate-pulse rounded-full bg-ink/[0.08] motion-reduce:animate-none", w)} />
);

function Row({ label, children, filled }: { label: string; children: ReactNode; filled: boolean }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-3 border-b border-ink/[0.07] py-3.5 last:border-0">
      <dt className="text-[0.8125rem] text-muted">{label}</dt>
      <dd className="min-w-0">{filled ? children : <Skeleton />}</dd>
    </div>
  );
}

export function SummaryCard({ data, visited, sent, className }: { data: FormState; visited: number; sent: boolean; className?: string }) {
  const t = useTranslations("Contact");
  const positions = [...data.positions, ...(data.otherOn && data.otherPosition ? [data.otherPosition] : [])];
  const Icon = data.industry ? INDUSTRY_ICONS[data.industry] : null;

  return (
    <div className={cn("relative rounded-card border border-white/60 bg-cream-soft p-6 text-ink shadow-float sm:p-7", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold">{t("summary.title")}</h3>
        <span className="size-2 rounded-full bg-brand" aria-hidden />
      </div>

      {sent && (
        <div aria-hidden className="pointer-events-none absolute top-4 right-4 -rotate-12">
          <div data-sent-stamp className="grid size-24 place-items-center rounded-full border-[3px] border-emerald-600 bg-cream-soft/80">
            <span className="flex items-center gap-1 font-display text-sm font-extrabold tracking-wider text-emerald-700 uppercase">
              {t("summary.sent")} <BadgeCheck className="size-4" />
            </span>
          </div>
        </div>
      )}

      <dl aria-live="polite" className="mt-4">
        <Row label={t("summary.industry")} filled={!!data.industry}>
          <Pop valueKey={data.industry ?? ""}>
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              {Icon && (
                <span className="grid size-7 place-items-center rounded-lg bg-peach text-brand-deep">
                  <Icon aria-hidden className="size-4" />
                </span>
              )}
              {data.industry && t(`industries.${data.industry}`)}
            </span>
          </Pop>
        </Row>
        {data.service && (
          <Row label={t("summary.service")} filled>
            <span className="text-sm font-semibold">{data.service}</span>
          </Row>
        )}
        <Row label={t("summary.positions")} filled={positions.length > 0}>
          <Pop valueKey={positions.join("|")}>
            <ul className="flex flex-wrap gap-1.5">
              {positions.map((p) => (
                <li key={p} className="rounded-full bg-peach/70 px-2.5 py-0.5 text-xs font-medium">
                  {p}
                </li>
              ))}
            </ul>
          </Pop>
        </Row>
        <Row label={t("summary.count")} filled={visited >= 1}>
          <Pop valueKey={String(data.count)}>
            <span className="font-display text-3xl leading-none font-semibold tabular-nums">{data.count}</span>
          </Pop>
        </Row>
        <Row label={t("summary.country")} filled={visited >= 1}>
          <Pop valueKey={data.country}>
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              {data.country !== "none" && <Flag code={data.country} />}
              {t(`countries.${data.country}`)}
            </span>
          </Pop>
        </Row>
        <Row label={t("summary.timeline")} filled={!!data.timeline}>
          <Pop valueKey={data.timeline ?? ""}>
            <span className="text-sm font-semibold">{data.timeline && t(`timelines.${data.timeline}`)}</span>
          </Pop>
        </Row>
        <Row label={t("summary.contact")} filled={data.name.trim().length > 1}>
          <Pop valueKey={`${data.name}|${data.company}`}>
            <span className="block truncate text-sm font-semibold">{data.name}</span>
            {data.company && <span className="block truncate text-xs text-muted">{data.company}</span>}
          </Pop>
        </Row>
      </dl>

      <ul className="mt-5 space-y-2.5 rounded-2xl bg-white/70 p-4 text-sm">
        {[
          [Clock, t("summary.perks.reply")],
          [ShieldCheck, t("summary.perks.guarantee")],
          [BadgeCheck, t("summary.perks.free")],
        ].map(([PerkIcon, text], i) => {
          const I = PerkIcon as typeof Clock;
          return (
            <li key={i} className="flex items-center gap-2.5">
              <I aria-hidden className="size-4 shrink-0 text-brand-deep" />
              {text as string}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Mobile: sticky bottom mini-bar that expands into the full summary. */
export function MobileSummaryBar({ data, visited, sent }: { data: FormState; visited: number; sent: boolean }) {
  const t = useTranslations("Contact");
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const parts = [
    data.industry && t(`industries.${data.industry}`),
    visited >= 1 && t("summary.workers", { count: data.count }),
  ].filter(Boolean);

  return (
    <div className="sticky bottom-3 z-20 mt-4 lg:hidden">
      {open && (
        <div id={panelId} className="mb-2 max-h-[70svh] overflow-y-auto rounded-card" data-lenis-prevent>
          <SummaryCard data={data} visited={visited} sent={sent} />
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 rounded-full border border-white/60 bg-cream-soft py-2.5 pr-3 pl-5 text-left text-sm text-ink shadow-float"
      >
        <span className="min-w-0 truncate">
          <span className="font-semibold">{t("summary.mobileLabel")}:</span>{" "}
          {parts.length ? parts.join(" · ") : <span className="text-muted">{t("summary.mobileEmpty")}</span>}
        </span>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-cream">
          <ChevronUp aria-hidden className={cn("size-4 transition-transform", open ? "rotate-180" : "")} />
          <span className="sr-only">{open ? t("summary.collapse") : t("summary.expand")}</span>
        </span>
      </button>
    </div>
  );
}
