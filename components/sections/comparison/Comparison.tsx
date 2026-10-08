"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  CircleCheck,
  CircleX,
  Hourglass,
  RefreshCcw,
  Search,
  ShieldCheck,
  Stamp,
  TriangleAlert,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { glass } from "@/components/ui/glass";
import {
  gsap,
  useGSAP,
  EASE,
  MOTION_QUERIES,
  STAGGER,
  ScrollTrigger,
  prefersReducedMotion,
  revealHeading,
  scaleIn,
} from "@/lib/animations";
import { cn } from "@/lib/cn";
import { CONTACT_ANCHOR } from "@/lib/nav";
import { useAnchorScroll } from "@/lib/useAnchorScroll";
import { ModeToggle, type Mode } from "./ModeToggle";

const ROWS: { key: string; icon: LucideIcon; selfIcon: LucideIcon }[] = [
  { key: "sourcing", icon: Search, selfIcon: CircleX },
  { key: "vetting", icon: UserCheck, selfIcon: TriangleAlert },
  { key: "permits", icon: Stamp, selfIcon: CircleX },
  { key: "time", icon: Hourglass, selfIcon: TriangleAlert },
  { key: "replacement", icon: RefreshCcw, selfIcon: CircleX },
];

const AUTO_DEMO_DELAY = 1.2; // s after the card has revealed
const CARD_ID = "comparison-card";

// Orange timeline bar: "super" shows ~38% of the track, "self" shows none.
const BAR_CLIP: Record<Mode, string> = {
  super: "inset(0% 62% 0% 0% round 999px)",
  self: "inset(0% 100% 0% 0% round 999px)",
};
const GREY_CLIP: Record<Mode, string> = {
  self: "inset(0% 0% 0% 0% round 999px)",
  super: "inset(0% 100% 0% 0% round 999px)",
};

export function Comparison() {
  const t = useTranslations("Comparison");
  const root = useRef<HTMLElement>(null);
  const onAnchorClick = useAnchorScroll();

  // SSR / no-JS / reduced motion: the final "with us" state.
  const [mode, setMode] = useState<Mode>("super");
  const userTouched = useRef(false);
  const skipNextAnimation = useRef(true); // first paint is never animated

  const choose = (m: Mode) => {
    userTouched.current = true;
    setMode(m);
  };

  // ---------- Entrance + one-time auto demo ----------
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.motion, () => {
        const card = root.current!.querySelector<HTMLElement>("[data-cmp-card]")!;
        revealHeading(root.current!);
        scaleIn(card, card);

        let demo: gsap.core.Tween | null = null;
        // Fires slightly before the card reveal ("top 80%"), so the flip to
        // "self" happens while the card is still invisible.
        ScrollTrigger.create({
          trigger: card,
          start: "top 88%",
          once: true,
          onEnter: () => {
            if (userTouched.current) return;
            skipNextAnimation.current = true;
            setMode("self");
            demo = gsap.delayedCall(AUTO_DEMO_DELAY + 0.9, () => {
              if (!userTouched.current) setMode("super");
            });
          },
        });
        return () => demo?.kill();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // ---------- Morph between states ----------
  useGSAP(
    () => {
      const show = `[data-m="${mode}"]`;
      const hide = `[data-m="${mode === "super" ? "self" : "super"}"]`;
      const instant = skipNextAnimation.current || prefersReducedMotion();
      skipNextAnimation.current = false;

      const accentOn = mode === "super";

      if (instant) {
        gsap.set(hide, { autoAlpha: 0, y: 0 });
        gsap.set(show, { autoAlpha: 1, y: 0 });
        gsap.set("[data-cmp-bar]", { clipPath: BAR_CLIP[mode] });
        gsap.set("[data-cmp-grey]", { clipPath: GREY_CLIP[mode] });
        gsap.set("[data-cmp-accent]", { autoAlpha: accentOn ? 1 : 0, scale: 1 });
        return;
      }

      const tl = gsap.timeline();
      // Card surface + bar labels crossfade
      tl.to(`[data-cmp-layer]${hide}, [data-cmp-label]${hide}`, { autoAlpha: 0, duration: 0.5 }, 0).to(
        `[data-cmp-layer]${show}, [data-cmp-label]${show}`,
        { autoAlpha: 1, duration: 0.6 },
        0.15,
      );
      // Rows: out, then in — staggered top to bottom
      gsap.utils.toArray<HTMLElement>("[data-cmp-row]").forEach((row, i) => {
        const at = i * STAGGER.items * 0.8;
        tl.to(row.querySelectorAll(hide), { autoAlpha: 0, y: -10, duration: 0.28, ease: "power2.in" }, at).fromTo(
          row.querySelectorAll(show),
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.55, ease: EASE.out },
          at + 0.22,
        );
      });
      // Timeline bar
      tl.to("[data-cmp-grey]", { clipPath: GREY_CLIP[mode], duration: 1.1, ease: EASE.inOut }, 0.15).to(
        "[data-cmp-bar]",
        { clipPath: BAR_CLIP[mode], duration: 1.1, ease: EASE.inOut },
        0.15,
      );
      // Floating guarantee card
      if (accentOn) {
        tl.fromTo(
          "[data-cmp-accent]",
          { autoAlpha: 0, scale: 0.7, y: 10 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(2)" },
          0.55,
        );
      } else {
        tl.to("[data-cmp-accent]", { autoAlpha: 0, scale: 0.85, duration: 0.25 }, 0);
      }
    },
    { scope: root, dependencies: [mode] },
  );

  // Hidden-by-default helper for the non-initial ("self") state markup.
  const selfHidden = "invisible opacity-0";

  return (
    <section ref={root} id="zasto" aria-labelledby="zasto-title" className="relative section-y">
      <Container>
        <SectionHeading
          id="zasto-title"
          reveal
          align="center"
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div className="mt-10 flex justify-center sm:mt-12">
          <ModeToggle
            value={mode}
            onChange={choose}
            labels={{ self: t("modes.self"), super: t("modes.super") }}
            ariaLabel={t("toggleLabel")}
            controls={CARD_ID}
          />
        </div>

        <div data-reveal data-cmp-card className="relative mx-auto mt-10 max-w-[68rem] sm:mt-12">
          {/* Floating accent — only in the "with us" state */}
          <div data-cmp-accent className="absolute -top-6 right-3 z-20 sm:-top-7 sm:-right-5 lg:-right-8">
            <div className={cn(glass, "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink")}>
              <ShieldCheck aria-hidden className="size-[1.125rem] text-brand-deep" />
              {t("guarantee")}
            </div>
          </div>

          <div
            id={CARD_ID}
            data-state={mode}
            className="group/card relative rounded-panel px-5 pt-9 pb-7 sm:px-10 sm:pt-12 sm:pb-10 lg:px-14"
          >
            {/* Surfaces: cool/grey "self" vs warm glowing "super" — crossfaded */}
            <div
              aria-hidden
              data-cmp-layer
              data-m="self"
              className={cn(
                "absolute inset-0 rounded-panel border border-ink/10 bg-[#EFEBE6] shadow-soft",
                selfHidden,
              )}
            />
            <div
              aria-hidden
              data-cmp-layer
              data-m="super"
              className="absolute inset-0 rounded-panel border border-brand/25 bg-cream-soft shadow-[0_0_0_6px_rgb(255_106_26/0.06),0_30px_80px_-30px_rgb(255_106_26/0.45)]"
            />

            <dl aria-live="polite" className="relative divide-y divide-ink/[0.08]">
              {ROWS.map(({ key, icon: Icon, selfIcon: SelfIcon }) => (
                <div
                  key={key}
                  data-cmp-row
                  className="grid gap-3 py-5 first:pt-0 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:items-center sm:gap-8 sm:py-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]"
                >
                  <dt className="flex items-center gap-3.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink/[0.06] text-ink/60 transition-colors duration-500 group-data-[state=super]/card:bg-peach group-data-[state=super]/card:text-brand-deep sm:size-11">
                      <Icon aria-hidden className="size-5" />
                    </span>
                    <span className="font-display text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink sm:text-lg">
                      {t(`rows.${key}.label`)}
                    </span>
                  </dt>
                  <dd className="grid">
                    <span
                      data-m="self"
                      className={cn("col-start-1 row-start-1 flex items-start gap-2.5 text-muted", selfHidden)}
                    >
                      <SelfIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-ink/40" />
                      <span className="text-base leading-relaxed">{t(`rows.${key}.self`)}</span>
                    </span>
                    <span data-m="super" className="col-start-1 row-start-1 flex items-start gap-2.5 text-ink">
                      <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-brand-hover" />
                      <span className="text-base leading-relaxed font-medium">
                        {t(`rows.${key}.super`)}
                      </span>
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            {/* Timeline bar */}
            <div className="relative mt-4 rounded-[20px] border border-ink/[0.07] bg-white/40 p-5 sm:mt-6 sm:p-6">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-sm font-semibold text-ink">{t("timeline.label")}</p>
                <p className="grid text-right text-sm font-semibold">
                  <span data-cmp-label data-m="self" className={cn("col-start-1 row-start-1 text-muted", selfHidden)}>
                    {t("timeline.selfSr")}
                  </span>
                  <span data-cmp-label data-m="super" className="col-start-1 row-start-1 text-brand-deep">
                    {t("timeline.super")}
                  </span>
                </p>
              </div>
              <div className="relative mt-4 flex items-center gap-3">
                <div className="relative h-3 flex-1 rounded-full bg-ink/[0.06]">
                  {/* "Self": long grey bar fading into an uncertain dashed end */}
                  <div
                    aria-hidden
                    data-cmp-grey
                    className="absolute inset-0 flex"
                    style={{ clipPath: GREY_CLIP.super }}
                  >
                    <div className="h-full w-[72%] rounded-l-full bg-ink/25" />
                    <div className="h-full flex-1 bg-[repeating-linear-gradient(90deg,rgb(30_24_20/0.25)_0_8px,transparent_8px_14px)] [mask-image:linear-gradient(90deg,#000,transparent)]" />
                  </div>
                  {/* "Super": short, solid orange */}
                  <div
                    aria-hidden
                    data-cmp-bar
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-hover to-brand"
                    style={{ clipPath: BAR_CLIP.super }}
                  />
                </div>
                <span
                  aria-hidden
                  data-cmp-label
                  data-m="self"
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border border-dashed border-ink/25 font-display text-sm font-bold text-muted",
                    selfHidden,
                  )}
                >
                  {t("timeline.self")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            href={CONTACT_ANCHOR}
            onClick={onAnchorClick}
            size="lg"
            icon={<ArrowRight className="size-5" />}
          >
            {t("cta")}
          </Button>
        </div>
      </Container>
    </section>
  );
}
