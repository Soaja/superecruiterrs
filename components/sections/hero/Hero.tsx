"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { gsap, useGSAP, EASE, MOTION_QUERIES } from "@/lib/animations";
import { CONTACT_ANCHOR, PROCESS_ANCHOR } from "@/lib/nav";
import { useAnchorScroll } from "@/lib/useAnchorScroll";
import { HeroStage } from "./HeroStage";
import { PartnerStrip } from "./PartnerStrip";
import { RotatingWord, type RotatingItem } from "./RotatingWord";

const ROTATING_KEYS = ["hotel", "restaurant", "warehouse", "construction", "transport"] as const;

// Placeholder employer monograms for the social-proof row.
// TODO: replace with real client logos/photos.
const PROOF_AVATARS = [
  { initials: "HM", className: "bg-peach text-ink" },
  { initials: "LG", className: "bg-ink text-cream" },
  { initials: "GR", className: "bg-brand text-ink" },
];

const ENTRANCE_DONE = 2.4; // ≈ when the stage cards have popped in

export function Hero() {
  const t = useTranslations("Hero");
  const root = useRef<HTMLElement>(null);
  const onAnchorClick = useAnchorScroll();

  const rotating: RotatingItem[] = ROTATING_KEYS.map((k) => ({
    pronoun: t(`rotating.${k}.pronoun`),
    word: t(`rotating.${k}.word`),
  }));

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_QUERIES.motion, () => {
        // ---------- Entrance ----------
        // The whole hero entrance (text, photo, floating cards, partner strip)
        // is CSS (.hero-* in globals.css): it plays from first paint and never
        // waits for JS — on slow phones hydration can take several seconds.

        // ---------- Idle float (each card on its own period) ----------
        gsap.utils.toArray<HTMLElement>("[data-fc-idle]").forEach((el, i) => {
          const period = Number(el.dataset.fcIdle) || 5;
          const dir = i % 2 ? 1 : -1;
          gsap.fromTo(
            el,
            { y: 6 * dir },
            { y: -6 * dir, duration: period / 2, ease: "sine.inOut", yoyo: true, repeat: -1 },
          );
        });

        // ---------- Visa status loop: "in progress" → "approved" ----------
        // Markup defaults to "approved" so reduced-motion / no-JS users see the final state.
        const pending = ["[data-visa-pending]", "[data-visa-dot-pending]"];
        const approved = ["[data-visa-approved]", "[data-visa-dot-approved]"];
        gsap.set(pending, { autoAlpha: 1 });
        gsap.set(approved, { autoAlpha: 0, scale: 0.6 });
        gsap.set("[data-visa-line]", { scaleX: 0 });
        gsap
          .timeline({ repeat: -1, repeatDelay: 2, delay: ENTRANCE_DONE - 0.6 })
          .to("[data-visa-line]", { scaleX: 1, duration: 0.9, ease: EASE.inOut }, 1.2)
          .to(pending, { autoAlpha: 0, duration: 0.25 }, 1.9)
          .to(approved, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2.5)" }, 2)
          .to(approved, { autoAlpha: 0, scale: 0.6, duration: 0.25 }, 6)
          .to("[data-visa-line]", { scaleX: 0, duration: 0.3 }, 6)
          .to(pending, { autoAlpha: 1, duration: 0.3 }, 6.15);

        // ---------- Scroll: text lifts away, photo recedes, cards separate ----------
        const scrub = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
        gsap.to("[data-hero-content]", { y: -90, opacity: 0.1, ease: "none", scrollTrigger: scrub });
        gsap.to("[data-photo-scroll]", { scale: 0.92, ease: "none", scrollTrigger: scrub });
        gsap.utils.toArray<HTMLElement>("[data-fc-scroll]").forEach((el) => {
          gsap.to(el, { y: Number(el.dataset.fcScroll) || 0, ease: "none", scrollTrigger: scrub });
        });
      });

      // ---------- Mouse parallax (desktop, fine pointer only) ----------
      mm.add(`${MOTION_QUERIES.motion} and (min-width: 1024px) and (pointer: fine)`, () => {
        const section = root.current!;
        const layers = gsap.utils.toArray<HTMLElement>("[data-fc-mouse]").map((el) => ({
          depth: Number(el.dataset.fcMouse) || 0.5,
          x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
        }));

        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          layers.forEach((l) => {
            l.x(nx * 36 * l.depth);
            l.y(ny * 28 * l.depth);
          });
        };
        const onLeave = () => layers.forEach((l) => (l.x(0), l.y(0)));

        section.addEventListener("pointermove", onMove);
        section.addEventListener("pointerleave", onLeave);
        return () => {
          section.removeEventListener("pointermove", onMove);
          section.removeEventListener("pointerleave", onLeave);
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  const lineClip = "-mt-[0.08em] -mb-[0.14em] block overflow-hidden pt-[0.08em] pb-[0.14em]";

  return (
    <section ref={root} aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* Ambient warmth */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute -top-48 -left-40 size-[32rem] rounded-full bg-peach/35 blur-[110px]" />
      </div>

      <Container className="grid items-center gap-10 pt-[calc(var(--header-h)+2rem)] pb-8 sm:gap-12 sm:pt-[calc(var(--header-h)+3rem)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-6 lg:pt-[calc(var(--header-h)+2.5rem)] lg:pb-12 xl:gap-10">
        {/* ---------- Text ---------- */}
        <div data-hero-content className="flex flex-col items-start">
          <div className="hero-rise" style={{ "--d": "0.1s" } as React.CSSProperties}>
            <Eyebrow>{t("eyebrow")}</Eyebrow>
          </div>

          <h1
            id="hero-title"
            className="mt-6 font-display text-[clamp(2.125rem,1.5rem+2.5vw,3.625rem)] leading-[1.06] font-semibold tracking-[-0.035em] text-ink sm:mt-7"
          >
            {/* Screen readers get one static sentence; the visual lines are hidden from them. */}
            <span className="sr-only">{t("title.srOnly")}</span>
            <span aria-hidden>
              <span className={lineClip}>
                <span className="hero-line block" style={{ "--d": "0.10s" } as React.CSSProperties}>
                  {t("title.line1")}
                </span>
              </span>
              <span className={lineClip}>
                <span className="hero-line block" style={{ "--d": "0.22s" } as React.CSSProperties}>
                  <RotatingWord prefix={t("title.line2")} items={rotating} startDelay={ENTRANCE_DONE} />
                </span>
              </span>
              <span className={lineClip}>
                <span className="hero-line block" style={{ "--d": "0.34s" } as React.CSSProperties}>
                  {t("title.line3")}
                </span>
              </span>
            </span>
          </h1>

          <p className="hero-rise mt-6 max-w-[44ch] text-lead text-muted sm:mt-7" style={{ "--d": "0.55s" } as React.CSSProperties}>
            {t("subhead")}
          </p>

          <div
            style={{ "--d": "0.65s" } as React.CSSProperties}
            className="hero-rise mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-6"
          >
            <Button
              href={CONTACT_ANCHOR}
              onClick={onAnchorClick}
              size="lg"
              icon={<ArrowRight className="size-5" />}
            >
              {t("ctaPrimary")}
            </Button>
            <a
              href={PROCESS_ANCHOR}
              onClick={onAnchorClick}
              className="group inline-flex h-14 items-center justify-center gap-3 rounded-full pr-2 font-semibold text-ink sm:justify-start"
            >
              <span className="grid size-11 place-items-center rounded-full border-[1.5px] border-ink/15 bg-cream-soft transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-cream">
                <ArrowDown
                  aria-hidden
                  className="size-[1.125rem] transition-transform duration-300 group-hover:translate-y-0.5"
                />
              </span>
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1.5px]">
                {t("ctaSecondary")}
              </span>
            </a>
          </div>

          <div className="hero-rise mt-9 flex items-center gap-3.5" style={{ "--d": "0.75s" } as React.CSSProperties}>
            <ul aria-hidden className="flex -space-x-2">
              {PROOF_AVATARS.map((a) => (
                <li
                  key={a.initials}
                  className={`grid size-10 place-items-center rounded-full text-[0.6875rem] font-bold tracking-wide ring-[3px] ring-cream ${a.className}`}
                >
                  {a.initials}
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted">
              {t.rich("socialProof.text", {
                // TODO: replace "XX" in messages (Hero.socialProof.count) with the real number.
                count: t("socialProof.count"),
                b: (chunks) => <strong className="font-semibold text-ink">{chunks}</strong>,
              })}
            </p>
          </div>
        </div>

        {/* ---------- Stage ---------- */}
        <HeroStage />
      </Container>

      <PartnerStrip />
    </section>
  );
}
