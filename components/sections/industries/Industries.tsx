"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  gsap,
  useGSAP,
  EASE,
  MOTION_QUERIES,
  ScrollTrigger,
  STAGGER,
  prefersReducedMotion,
  revealHeading,
  revealOnScroll,
} from "@/lib/animations";
import { cn } from "@/lib/cn";
import { CONTACT_ANCHOR } from "@/lib/nav";
import { useAnchorScroll } from "@/lib/useAnchorScroll";
import { DEFAULT_INDUSTRY, INDUSTRIES, type Industry } from "./data";
import { IndustryCard } from "./IndustryCard";

const AUTO_ROTATE = 6; // seconds, until the first user interaction
const GROW = { active: 3, idle: 1 }; // flex-grow → ~60% / 20% / 20%
const KEN_BURNS = 9; // seconds for the 1 → 1.06 photo zoom
const DESKTOP = "(min-width: 1024px)";

const num = (i: number) => String(i + 1).padStart(2, "0");
const overlay =
  "absolute inset-0 bg-[linear-gradient(to_top,rgb(30_24_20/0.92)_0%,rgb(30_24_20/0.6)_38%,rgb(30_24_20/0.12)_70%,rgb(30_24_20/0.05)_100%)]";

/** Number, title, description, position chips and CTA — white on photo. */
function IndustryContent({
  industry,
  index,
  onAnchorClick,
  headingId,
}: {
  industry: Industry;
  index: number;
  onAnchorClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  headingId?: string;
}) {
  const t = useTranslations(`Industries`);
  const positions = t.raw(`items.${industry.key}.positions`) as string[];

  return (
    <>
      <p data-ind-stagger className="font-display text-sm font-semibold tracking-wide text-white/70">
        {num(index)}
      </p>
      <h3
        id={headingId}
        data-ind-stagger
        className="mt-1.5 font-display text-[clamp(1.625rem,1.2rem+1.4vw,2.5rem)] leading-[1.08] font-semibold tracking-[-0.025em] text-white"
      >
        {t(`items.${industry.key}.title`)}
      </h3>
      <p data-ind-stagger className="mt-3 max-w-md text-base leading-relaxed text-white/85">
        {t(`items.${industry.key}.description`)}
      </p>
      <ul data-ind-stagger aria-label={t("positionsLabel")} className="mt-5 flex flex-wrap gap-2">
        {positions.map((p) => (
          <li
            key={p}
            className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[0.8125rem] font-medium text-white backdrop-blur-md"
          >
            {p}
          </li>
        ))}
      </ul>
      <div data-ind-stagger className="mt-6">
        <Button
          href={`?industrija=${industry.slug}${CONTACT_ANCHOR}`}
          onClick={onAnchorClick}
          icon={<ArrowRight className="size-[1.125rem]" />}
          className="h-auto min-h-12 py-3 text-left whitespace-normal"
        >
          {t(`items.${industry.key}.cta`)}
        </Button>
      </div>
    </>
  );
}

export function Industries() {
  const t = useTranslations("Industries");
  const root = useRef<HTMLElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const onAnchorClick = useAnchorScroll();

  const [active, setActive] = useState(DEFAULT_INDUSTRY);
  const prevActive = useRef(DEFAULT_INDUSTRY);
  const firstRun = useRef(true);
  const interacted = useRef(false);
  const rotateCall = useRef<gsap.core.Tween | null>(null);
  const kenBurns = useRef<gsap.core.Tween | null>(null);
  const morph = useRef<gsap.core.Timeline | null>(null);

  const activate = (i: number) => {
    interacted.current = true;
    rotateCall.current?.kill();
    setActive(i);
  };

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const n = INDUSTRIES.length;
    const map: Record<string, number> = {
      ArrowRight: (i + 1) % n,
      ArrowDown: (i + 1) % n,
      ArrowLeft: (i - 1 + n) % n,
      ArrowUp: (i - 1 + n) % n,
      Home: 0,
      End: n - 1,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    buttons.current[map[e.key]]?.focus(); // focus → activate
  };

  // ---------- Entrance + auto-rotate ----------
  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();

      mm.add(MOTION_QUERIES.motion, () => {
        revealHeading(el);
        revealOnScroll("[data-ind-panel]", el.querySelector("[data-ind-row]")!, { stagger: STAGGER.lines, duration: 1 }, 60);
        revealOnScroll("[data-ind-slide]", el.querySelector("[data-ind-carousel]")!, { stagger: STAGGER.lines, duration: 1 }, 60);
      });

      mm.add(`${MOTION_QUERIES.motion} and ${DESKTOP}`, () => {
        const schedule = () => {
          rotateCall.current?.kill();
          if (interacted.current) return;
          rotateCall.current = gsap.delayedCall(AUTO_ROTATE, () => {
            if (interacted.current) return;
            setActive((a) => (a + 1) % INDUSTRIES.length);
            schedule();
          });
        };
        const st = ScrollTrigger.create({
          trigger: el.querySelector("[data-ind-row]"),
          start: "top 75%",
          end: "bottom 25%",
          onToggle: (self) => (self.isActive ? schedule() : rotateCall.current?.kill()),
        });
        return () => {
          st.kill();
          rotateCall.current?.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  // ---------- Morph panels when the active industry changes (desktop) ----------
  useGSAP(
    () => {
      const panels = gsap.utils.toArray<HTMLElement>("[data-ind-panel]");
      if (!panels.length) return;
      const from = prevActive.current;
      prevActive.current = active;
      const instant = firstRun.current || prefersReducedMotion();
      firstRun.current = false;

      const q = (i: number, sel: string) => panels[i].querySelectorAll(sel);
      const startKenBurns = () => {
        if (prefersReducedMotion()) return;
        kenBurns.current?.kill();
        kenBurns.current = gsap.fromTo(
          q(active, "[data-ind-img]"),
          { scale: 1 },
          { scale: 1.06, duration: KEN_BURNS, ease: "none" },
        );
      };

      if (instant) {
        panels.forEach((p, i) => {
          const on = i === active;
          gsap.set(p, { flexGrow: on ? GROW.active : GROW.idle });
          gsap.set(q(i, "[data-ind-expanded]"), { autoAlpha: on ? 1 : 0 });
          gsap.set(q(i, "[data-ind-collapsed]"), { autoAlpha: on ? 0 : 1 });
        });
        startKenBurns();
        return;
      }
      if (from === active) return;

      // Rapid switching (hover → focus → keys): drop the in-flight transition
      // and drive EVERY panel to its target state, not just the previous one.
      morph.current?.kill();
      const tl = (morph.current = gsap.timeline());
      panels.forEach((p, i) => {
        const on = i === active;
        tl.to(p, { flexGrow: on ? GROW.active : GROW.idle, duration: 0.7, ease: "power3.inOut" }, 0);
        if (on) return;
        tl.to(q(i, "[data-ind-expanded]"), { autoAlpha: 0, duration: 0.2 }, 0)
          .to(q(i, "[data-ind-collapsed]"), { autoAlpha: 1, duration: 0.4 }, 0.45)
          .to(q(i, "[data-ind-img]"), { scale: 1, duration: 0.7, ease: "power3.inOut" }, 0);
      });
      tl.to(q(active, "[data-ind-collapsed]"), { autoAlpha: 0, duration: 0.2 }, 0)
        .set(q(active, "[data-ind-expanded]"), { autoAlpha: 1 }, 0.45)
        .fromTo(
          q(active, "[data-ind-stagger]"),
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.06, ease: EASE.out },
          0.45,
        )
        .fromTo(
          q(active, "[data-ind-float]"),
          { autoAlpha: 0, scale: 0.85, y: -8 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.8)" },
          0.6,
        );
      // Only the hospitality card has a meter
      const meter = q(active, "[data-ind-meter]");
      if (meter.length) tl.fromTo(meter, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: EASE.inOut }, 0.7);
      tl.add(startKenBurns, 0.2);
    },
    { scope: root, dependencies: [active] },
  );

  return (
    <section
      ref={root}
      id="industrije"
      aria-labelledby="industrije-title"
      className="relative section-y"
    >
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <SectionHeading
            id="industrije-title"
            reveal
            eyebrow={t("eyebrow")}
            title={t("title")}
            subtitle={t("subtitle")}
          />
          <a
            data-reveal
            data-heading-sub
            href={CONTACT_ANCHOR}
            onClick={onAnchorClick}
            className="group inline-flex shrink-0 items-center gap-2 self-start pb-1 text-[0.9375rem] font-semibold text-ink lg:self-auto"
          >
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1.5px]">
              {t("askLink")}
            </span>
            <ArrowRight
              aria-hidden
              className="size-4 text-brand-deep transition-transform duration-300 group-hover:translate-x-1"
            />
          </a>
        </div>

        {/* ---------- Desktop: expanding photo panels ---------- */}
        <div data-ind-row role="group" aria-label={t("listLabel")} className="mt-14 hidden h-[560px] gap-4 lg:flex">
          {INDUSTRIES.map((industry, i) => {
            const isActive = i === active;
            const initiallyActive = i === DEFAULT_INDUSTRY;
            const Icon = industry.icon;
            const contentId = `industry-${industry.key}`;
            return (
              <div
                key={industry.key}
                data-ind-panel
                data-reveal
                style={{ flexGrow: initiallyActive ? GROW.active : GROW.idle }}
                className="relative min-w-0 basis-0 overflow-hidden rounded-panel bg-ink shadow-lift"
              >
                <div data-ind-img className="absolute inset-0">
                  <Image
                    src={industry.photo}
                    alt={t(`items.${industry.key}.photoAlt`)}
                    fill
                    sizes="(min-width: 1024px) 62vw, 1px"
                    className="object-cover"
                    style={{ objectPosition: industry.focus }}
                  />
                </div>
                <div aria-hidden className={overlay} />

                {/* Whole panel is the trigger */}
                <button
                  ref={(el) => {
                    buttons.current[i] = el;
                  }}
                  type="button"
                  aria-expanded={isActive}
                  aria-controls={contentId}
                  onClick={() => activate(i)}
                  onFocus={() => activate(i)}
                  onMouseEnter={() => activate(i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className="absolute inset-0 z-10 cursor-pointer rounded-panel focus-visible:outline-2 focus-visible:-outline-offset-[6px] focus-visible:outline-white"
                >
                  <span className="sr-only">
                    {num(i)} {t(`items.${industry.key}.title`)}
                  </span>
                </button>

                {/* Collapsed: vertical title + glass pill */}
                <div
                  aria-hidden
                  data-ind-collapsed
                  className={cn(
                    "pointer-events-none absolute inset-0 z-20 flex flex-col items-start justify-end gap-6 p-6",
                    initiallyActive && "invisible opacity-0",
                  )}
                >
                  <span className="font-display text-2xl font-semibold tracking-[-0.02em] whitespace-nowrap text-white [writing-mode:vertical-rl] rotate-180 xl:text-[1.75rem]">
                    {t(`items.${industry.key}.title`)}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-cream-soft/85 py-1.5 pr-3.5 pl-1.5 text-sm font-semibold text-ink shadow-soft backdrop-blur-md">
                    <span className="grid size-7 place-items-center rounded-full bg-peach text-brand-deep">
                      <Icon className="size-4" />
                    </span>
                    {num(i)}
                  </span>
                </div>

                {/* Expanded: full content */}
                <div
                  id={contentId}
                  data-ind-expanded
                  className={cn("pointer-events-none absolute inset-0 z-20", !initiallyActive && "invisible opacity-0")}
                >
                  <div data-ind-float className="pointer-events-auto absolute top-6 right-6">
                    <IndustryCard industry={industry.key} />
                  </div>
                  <div className="pointer-events-auto absolute bottom-0 left-0 w-[clamp(24rem,42vw,36rem)] p-8 xl:p-10">
                    <IndustryContent industry={industry} index={i} onAnchorClick={onAnchorClick} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>

      {/* ---------- Mobile / tablet: snap carousel with peek ---------- */}
      <div
        data-ind-carousel
        role="list"
        aria-label={t("listLabel")}
        className="mt-10 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:scroll-px-6 sm:gap-4 sm:px-6 lg:hidden [&::-webkit-scrollbar]:hidden"
      >
        {INDUSTRIES.map((industry, i) => (
          <article
            key={industry.key}
            role="listitem"
            data-ind-slide
            data-reveal
            aria-labelledby={`industry-m-${industry.key}`}
            className="relative flex min-h-[30rem] w-[86%] shrink-0 snap-start flex-col justify-between gap-8 overflow-hidden rounded-card bg-ink p-5 shadow-lift sm:w-[62%] sm:p-7"
          >
            <Image
              src={industry.photo}
              alt={t(`items.${industry.key}.photoAlt`)}
              fill
              sizes="(min-width: 640px) 62vw, 86vw"
              className="object-cover"
              style={{ objectPosition: industry.focus }}
            />
            <div aria-hidden className={overlay} />
            <div className="relative z-10 -mt-1 -mr-1 self-end">
              <IndustryCard industry={industry.key} />
            </div>
            <div className="relative z-10">
              <IndustryContent
                industry={industry}
                index={i}
                onAnchorClick={onAnchorClick}
                headingId={`industry-m-${industry.key}`}
              />
            </div>
          </article>
        ))}
        {/* trailing spacer so the last card can snap with a gutter */}
        <div aria-hidden className="w-1 shrink-0" />
      </div>
    </section>
  );
}
