import { useTranslations } from "next-intl";
import { BadgeCheck, Truck } from "lucide-react";
import { glass } from "@/components/ui/glass";
import { cn } from "@/lib/cn";
import type { IndustryKey } from "./data";

// Placeholder team monograms. TODO: replace with real worker photos.
const TEAM = [
  { initials: "AK", className: "bg-peach text-ink" },
  { initials: "SB", className: "bg-ink text-cream" },
  { initials: "RM", className: "bg-brand text-ink" },
  { initials: "+9", className: "bg-cream text-ink" },
];

/** Floating glassy "UI snippet" shown in the active panel's top-right corner. */
export function IndustryCard({ industry, className }: { industry: IndustryKey; className?: string }) {
  const t = useTranslations(`Industries.items.${industry}.card`);
  const base = cn(glass, "p-3.5 text-ink sm:p-4", className);

  if (industry === "hospitality") {
    return (
      <div className={cn(base, "w-[12.5rem] sm:w-[14rem]")}>
        <p className="text-xs text-muted">{t("label")}</p>
        <p className="mt-0.5 text-sm font-semibold sm:text-base">{t("value")}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10">
          <div data-ind-meter className="h-full w-[84%] origin-left rounded-full bg-brand" />
        </div>
        <p className="mt-1.5 text-[0.6875rem] font-medium text-brand-deep">{t("meter")}</p>
      </div>
    );
  }

  if (industry === "logistics") {
    return (
      <div className={cn(base, "flex items-center gap-3")}>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-peach text-brand-deep sm:size-10">
          <Truck aria-hidden className="size-[1.125rem]" />
        </span>
        <div>
          <p className="text-sm font-semibold whitespace-nowrap">{t("value")}</p>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-emerald-800">
            <BadgeCheck aria-hidden className="size-3.5" />
            {t("badge")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(base, "flex items-center gap-3")}>
      <ul aria-hidden className="flex -space-x-2">
        {TEAM.map((m) => (
          <li
            key={m.initials}
            className={`grid size-8 place-items-center rounded-full text-[0.625rem] font-bold ring-2 ring-cream-soft ${m.className}`}
          >
            {m.initials}
          </li>
        ))}
      </ul>
      <div>
        <p className="text-sm font-semibold whitespace-nowrap">{t("value")}</p>
        <p className="text-[0.6875rem] text-muted">{t("label")}</p>
      </div>
    </div>
  );
}
