"use client";

import { useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Building2, Factory, Hotel, ShieldCheck, Store, Warehouse } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { gsap, useGSAP, MOTION_QUERIES, STAGGER, revealHeading, scaleIn } from "@/lib/animations";
import { cn } from "@/lib/cn";
import { NetworkMap } from "./NetworkMap";

const tileBase =
  "relative overflow-hidden rounded-card border border-ink/[0.07] bg-cream-soft shadow-soft";
const lift =
  "transition-[translate,box-shadow] duration-500 ease-(--ease-out-expo) hover:-translate-y-1 hover:shadow-lift motion-reduce:hover:translate-y-0";

/** Cursor-following highlight; position comes from --sx/--sy set on pointermove. */
function Spotlight({ dark = false }: { dark?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/bento:opacity-100",
        dark
          ? "bg-[radial-gradient(380px_circle_at_var(--sx)_var(--sy),rgb(255_255_255/0.07),transparent_60%)]"
          : "bg-[radial-gradient(380px_circle_at_var(--sx)_var(--sy),rgb(255_106_26/0.08),transparent_60%)]",
      )}
    />
  );
}

/* ---------- Tiny decorative visuals for stat tiles ---------- */

function MiniCalendar() {
  return (
    <div className="rounded-xl border border-ink/[0.08] bg-white/80 p-2 shadow-soft">
      <div className="mb-1.5 h-1.5 w-8 rounded-full bg-ink/15" />
      <div className="grid grid-cols-7 gap-[3px]">
        {Array.from({ length: 28 }, (_, i) => (
          <span
            key={i}
            className={cn(
              "size-2 rounded-[2px] sm:size-2.5",
              i >= 9 && i <= 22 ? "bg-brand/85" : "bg-ink/10",
              (i === 9 || i === 22) && "bg-brand-hover",
            )}
          />
        ))}
      </div>
    </div>
  );
}

// TODO: placeholder monograms — replace with real worker photos.
const MINI_AVATARS = [
  "bg-peach text-ink",
  "bg-ink text-cream",
  "bg-brand text-ink",
  "bg-[#F3E6DA] text-ink",
  "bg-cream text-ink",
];
function MiniAvatars() {
  return (
    <div className="flex -space-x-2">
      {["RK", "BS", "AT", "RP", "+"].map((m, i) => (
        <span
          key={m}
          className={cn("grid size-7 place-items-center rounded-full text-[0.5625rem] font-bold ring-2 ring-cream-soft sm:size-8", MINI_AVATARS[i])}
        >
          {m}
        </span>
      ))}
    </div>
  );
}

function MiniBuildings() {
  const icons = [Hotel, Warehouse, Building2, Factory, Store];
  return (
    <div className="flex items-end gap-1">
      {icons.map((Icon, i) => (
        <Icon
          key={i}
          className={cn("size-[1.125rem] sm:size-5", i === 2 ? "text-brand-deep" : "text-ink/25")}
        />
      ))}
    </div>
  );
}

function MiniRing() {
  return (
    <svg viewBox="0 0 44 44" className="size-10 -rotate-90 sm:size-12">
      <circle cx="22" cy="22" r="18" fill="none" stroke="rgb(30 24 20 / 0.08)" strokeWidth="5" />
      <circle cx="22" cy="22" r="18" fill="none" stroke="var(--brand)" strokeWidth="5" strokeLinecap="round" pathLength={1} strokeDasharray="0.86 1" />
    </svg>
  );
}

function StatTile({ value, label, visual, className }: { value: string; label: string; visual: ReactNode; className?: string }) {
  return (
    <div data-tile className={cn(tileBase, lift, "flex flex-col justify-between p-4 sm:p-6 lg:p-7", className)}>
      <Spotlight />
      <div aria-hidden className="relative z-10 mb-6 self-end sm:mb-8">
        {visual}
      </div>
      <div className="relative z-10">
        <CountUp
          value={value}
          className="block font-display text-[clamp(2rem,1.5rem+2vw,3.25rem)] leading-none font-semibold tracking-[-0.03em] text-ink"
        />
        <p className="mt-2 text-sm leading-snug text-muted sm:text-[0.9375rem]">{label}</p>
      </div>
    </div>
  );
}

export function Network() {
  const t = useTranslations("Network");
  const root = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.motion, () => {
        revealHeading(root.current!);
        scaleIn("[data-tile]", grid.current!, { stagger: STAGGER.items, duration: 1 }, { scale: 0.97, y: 40 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Spotlight: per-tile cursor coordinates (rAF-throttled)
  const frame = useRef(0);
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      grid.current?.querySelectorAll<HTMLElement>("[data-tile]").forEach((tile) => {
        const r = tile.getBoundingClientRect();
        tile.style.setProperty("--sx", `${clientX - r.left}px`);
        tile.style.setProperty("--sy", `${clientY - r.top}px`);
      });
    });
  };

  return (
    <section ref={root} id="mreza" aria-labelledby="mreza-title" className="relative section-y">
      <Container>
        <SectionHeading id="mreza-title" reveal eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <div
          ref={grid}
          onPointerMove={onPointerMove}
          className="group/bento mt-12 grid grid-cols-2 gap-3 sm:mt-14 sm:grid-cols-6 sm:gap-4 lg:grid-cols-12 lg:gap-5"
        >
          {/* [A] Map */}
          <div data-tile className={cn(tileBase, "col-span-2 sm:col-span-6 lg:col-span-8 lg:row-span-2")}>
            <Spotlight />
            <div className="relative z-10 h-full">
              <NetworkMap />
            </div>
          </div>

          {/* [B]–[E] Stats */}
          <StatTile
            className="sm:col-span-3 lg:col-span-4"
            value={t("stats.arrival.value")}
            label={t("stats.arrival.label")}
            visual={<MiniCalendar />}
          />
          <StatTile
            className="sm:col-span-3 lg:col-span-4"
            value={t("stats.workers.value")}
            label={t("stats.workers.label")}
            visual={<MiniAvatars />}
          />
          <StatTile
            className="sm:col-span-3 lg:col-span-4"
            value={t("stats.employers.value")}
            label={t("stats.employers.label")}
            visual={<MiniBuildings />}
          />
          <StatTile
            className="sm:col-span-3 lg:col-span-4"
            value={t("stats.retention.value")}
            label={t("stats.retention.label")}
            visual={<MiniRing />}
          />

          {/* [F] Guarantee */}
          <div
            data-tile
            className={cn(
              "grain relative col-span-2 flex flex-col justify-between overflow-hidden rounded-card bg-ink p-6 text-cream shadow-lift sm:col-span-6 lg:col-span-4 lg:p-7",
              lift,
            )}
          >
            <Spotlight dark />
            <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-[radial-gradient(closest-side,rgb(255_106_26/0.45),transparent)]" />
            <ShieldCheck aria-hidden className="relative z-10 size-9 text-brand" />
            <div className="relative z-10 mt-8">
              <p className="font-display text-[clamp(2.25rem,1.6rem+2vw,3.25rem)] leading-none font-semibold tracking-[-0.03em] text-brand">
                {t("guarantee.value")}
              </p>
              <p className="mt-2 max-w-[22rem] text-[0.9375rem] text-cream/80">{t("guarantee.text")}</p>
              <a
                href="#faq"
                className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cream"
              >
                <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
                  {t("guarantee.link")}
                </span>
                <ArrowRight className="size-4 text-brand transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
