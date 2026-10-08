"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, BadgeCheck, Circle, Diamond, Hexagon, Square, Triangle, Pentagon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Flag, type FlagCode } from "@/components/ui/Flag";
import { Marquee } from "@/components/ui/Marquee";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { glass } from "@/components/ui/glass";
import {
  gsap,
  useGSAP,
  EASE,
  MOTION_QUERIES,
  ScrollTrigger,
  prefersReducedMotion,
  revealHeading,
  scaleIn,
} from "@/lib/animations";
import { cn } from "@/lib/cn";

type Item = {
  quote: string;
  name: string;
  role: string;
  company: string;
  city: string;
  initials: string;
  photoAlt: string;
  result: { title: string; meta?: string; badge?: string };
};

const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=75`;

// TODO: placeholder testimonials/photos — the client will provide real ones.
const MEDIA: { photo: string; flag: FlagCode }[] = [
  { photo: unsplash("photo-1600565193348-f74bd3c7ccdf"), flag: "nepal" },
  { photo: unsplash("photo-1541888946425-d81bb19240f5"), flag: "uzbekistan" },
  { photo: unsplash("photo-1586528116311-ad8dd3c8310d"), flag: "kenya" },
];
const LOGO_SHAPES = [Hexagon, Circle, Triangle, Square, Diamond, Pentagon];

const SLIDE_SECONDS = 8;
const SWIPE_THRESHOLD = 60;
const pad = (n: number) => String(n).padStart(2, "0");

function QuoteWords({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <span className="-mt-[0.08em] -mb-[0.14em] inline-block overflow-hidden pt-[0.08em] pb-[0.14em] align-top">
            <span data-q-word className="inline-block">
              {w}
            </span>
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </>
  );
}

export function Testimonials() {
  const t = useTranslations("Testimonials");
  const items = t.raw("items") as Item[];
  const logos = t.raw("logos") as string[];
  const total = items.length;

  const root = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [autoplaying, setAutoplaying] = useState(true);
  const autoplay = useRef(true);
  const inView = useRef(false);
  const hovered = useRef(false);
  const progress = useRef<gsap.core.Tween | null>(null);
  const prevIndex = useRef(0);
  const drag = useRef<{ x: number; id: number } | null>(null);

  const stopAutoplay = () => {
    if (!autoplay.current) return;
    autoplay.current = false;
    progress.current?.kill();
    setAutoplaying(false);
  };
  const go = (dir: 1 | -1) => {
    stopAutoplay();
    setIndex((i) => (i + dir + total) % total);
  };
  const syncPaused = () => progress.current?.paused(!inView.current || hovered.current);

  // In-view tracking + entrance
  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.motion, () => {
        revealHeading(el);
        scaleIn(el.querySelector("[data-tcard]")!, el.querySelector("[data-tcard]")!);
      });
      const st = ScrollTrigger.create({
        trigger: el.querySelector("[data-tcard]"),
        start: "top 85%",
        end: "bottom 15%",
        onToggle: (self) => {
          inView.current = self.isActive;
          syncPaused();
        },
      });
      return () => {
        st.kill();
        mm.revert();
      };
    },
    { scope: root },
  );

  // Slide change: transition + (re)start the progress bar
  useGSAP(
    () => {
      const el = root.current!;
      const slides = gsap.utils.toArray<HTMLElement>("[data-slide]", el);
      const bar = el.querySelector("[data-progress]");
      const from = prevIndex.current;
      prevIndex.current = index;
      const reduced = prefersReducedMotion();

      if (from !== index) {
        const next = slides[index];
        const q = gsap.utils.selector(next);
        gsap.set(slides, { x: 0 });
        slides.forEach((s, i) => i !== index && i !== from && gsap.set(s, { autoAlpha: 0 }));
        if (reduced) {
          gsap.set(slides[from], { autoAlpha: 0 });
          gsap.set(next, { autoAlpha: 1 });
        } else {
          gsap
            .timeline()
            .to(slides[from], { autoAlpha: 0, duration: 0.35, ease: "power2.in" })
            .set(next, { autoAlpha: 1 })
            .fromTo(q("[data-q-word]"), { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.022, ease: EASE.out })
            .fromTo(q("[data-tphoto]"), { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 0.9, ease: EASE.out }, "<")
            .fromTo(q("[data-tperson]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: EASE.out }, "<0.25")
            .fromTo(
              q("[data-tresult]"),
              { autoAlpha: 0, scale: 0.75, y: 10 },
              { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(2)" },
              "<0.15",
            );
        }
      }

      progress.current?.kill();
      if (autoplay.current && !reduced) {
        progress.current = gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: SLIDE_SECONDS,
            ease: "none",
            paused: !inView.current || hovered.current,
            onComplete: () => setIndex((i) => (i + 1) % total),
          },
        );
      } else {
        // Manual mode: bar shows position in the set
        gsap.to(bar, { scaleX: (index + 1) / total, duration: reduced ? 0 : 0.5, ease: EASE.out });
      }
    },
    { scope: root, dependencies: [index] },
  );

  /* ---------- Swipe / drag ---------- */
  const onPointerDown = (e: RPointerEvent) => {
    if ((e.target as HTMLElement).closest("a,button")) return;
    drag.current = { x: e.clientX, id: e.pointerId };
  };
  const onPointerMove = (e: RPointerEvent) => {
    if (!drag.current || drag.current.id !== e.pointerId) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 6) (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    gsap.set(root.current!.querySelectorAll("[data-slide]")[index], { x: dx * 0.25 });
  };
  const onPointerUp = (e: RPointerEvent) => {
    if (!drag.current || drag.current.id !== e.pointerId) return;
    const dx = e.clientX - drag.current.x;
    drag.current = null;
    if (Math.abs(dx) > SWIPE_THRESHOLD) go(dx < 0 ? 1 : -1);
    else gsap.to(root.current!.querySelectorAll("[data-slide]")[index], { x: 0, duration: 0.4, ease: EASE.out });
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  };

  const roundBtn =
    "grid size-12 place-items-center rounded-full border border-ink/15 bg-cream-soft text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-cream";

  return (
    <section ref={root} id="reference" aria-labelledby="reference-title" className="relative rounded-section bg-peach-tint section-y">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading id="reference-title" reveal eyebrow={t("eyebrow")} title={t("title")} />
          <div className="flex items-center gap-4 self-start lg:self-auto">
            <p aria-hidden className="font-display text-sm font-semibold text-muted tabular-nums">
              <span className="text-ink">{pad(index + 1)}</span> / {pad(total)}
            </p>
            <div className="flex gap-2">
              <button type="button" aria-label={t("prev")} onClick={() => go(-1)} className={roundBtn}>
                <ArrowLeft className="size-5" />
              </button>
              <button type="button" aria-label={t("next")} onClick={() => go(1)} className={roundBtn}>
                <ArrowRight className="size-5" />
              </button>
            </div>
          </div>
        </div>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label={t("carouselLabel")}
          // Focusable so ←/→ work as soon as keyboard users reach the carousel
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerEnter={() => ((hovered.current = true), syncPaused())}
          onPointerLeave={() => ((hovered.current = false), syncPaused())}
          onFocus={() => ((hovered.current = true), syncPaused())}
          onBlur={() => ((hovered.current = false), syncPaused())}
          className="mt-10 rounded-panel sm:mt-12"
        >
          <div
            data-tcard
            data-reveal
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="relative cursor-grab touch-pan-y overflow-hidden rounded-panel border border-white/70 bg-cream-soft/90 p-5 shadow-lift select-none active:cursor-grabbing sm:p-8 lg:p-12"
          >
            <div aria-live={autoplaying ? "off" : "polite"} className="grid">
              {items.map((item, i) => {
                const active = i === index;
                const media = MEDIA[i % MEDIA.length];
                return (
                  <div
                    key={i}
                    data-slide
                    role="group"
                    aria-roledescription="slide"
                    aria-label={t("slideLabel", { current: i + 1, total })}
                    aria-hidden={!active}
                    inert={!active}
                    className={cn(
                      "col-start-1 row-start-1 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14",
                      i !== 0 && "invisible opacity-0",
                    )}
                  >
                    <div className="flex flex-col">
                      <span aria-hidden className="block h-12 font-display text-[6rem] leading-[0.9] font-bold text-brand sm:h-16 sm:text-[8rem]">
                        &ldquo;
                      </span>
                      <blockquote className="mt-2 font-display text-[clamp(1.375rem,1.05rem+1.1vw,2rem)] leading-[1.3] font-medium tracking-[-0.015em] text-ink">
                        <QuoteWords text={item.quote} />
                      </blockquote>
                      <div data-tperson className="mt-auto flex flex-wrap items-center justify-between gap-5 pt-8">
                        <div className="flex items-center gap-3.5">
                          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-peach text-sm font-bold text-ink">
                            {item.initials}
                          </span>
                          <div>
                            <p className="font-semibold text-ink">{item.name}</p>
                            <p className="text-sm text-muted">
                              {item.role}, {item.company} · {item.city}
                            </p>
                          </div>
                        </div>
                        {/* Company logo placeholder (TODO) */}
                        <span
                          aria-hidden
                          className="rounded-lg border border-dashed border-ink/15 px-3 py-1.5 font-display text-sm font-bold tracking-[0.12em] text-ink/50 uppercase"
                        >
                          {item.company}
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      <div
                        data-tphoto
                        className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-peach sm:aspect-[16/10] lg:aspect-square"
                      >
                        <Image
                          src={media.photo}
                          alt={item.photoAlt}
                          fill
                          sizes="(min-width: 1024px) 34vw, 90vw"
                          className="object-cover"
                          draggable={false}
                        />
                      </div>
                      <div data-tresult className="absolute -bottom-4 left-4 sm:-left-6 lg:bottom-8">
                        <div className={cn(glass, "flex items-center gap-3 p-3.5 pr-5")}>
                          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white shadow-soft">
                            <Flag code={media.flag} />
                          </span>
                          <div>
                            <p className="text-sm font-semibold whitespace-nowrap text-ink">{item.result.title}</p>
                            {item.result.badge ? (
                              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-emerald-800">
                                <BadgeCheck className="size-3.5" />
                                {item.result.badge}
                              </span>
                            ) : (
                              <p className="text-xs text-muted">{item.result.meta}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Autoplay progress / position */}
          <div aria-hidden className="mx-auto mt-6 h-1 max-w-xs overflow-hidden rounded-full bg-ink/10">
            <div data-progress className="h-full origin-left scale-x-0 rounded-full bg-brand" />
          </div>
        </div>
      </Container>

      {/* Logo marquee (TODO: real client logos) */}
      <div className="mt-16 sm:mt-20">
        <p className="px-4 text-center text-[0.6875rem] font-semibold tracking-[0.12em] text-muted uppercase sm:text-xs sm:tracking-[0.16em]">
          {t("logosLabel")}
        </p>
        <Marquee duration={45} className="mt-4">
          <ul className="flex items-center">
            {logos.map((name, i) => {
              const Shape = LOGO_SHAPES[i % LOGO_SHAPES.length];
              return (
                <li
                  key={name}
                  className="flex items-center gap-2.5 px-10 font-display text-xl font-bold tracking-[-0.02em] whitespace-nowrap text-ink/55 sm:px-14 sm:text-2xl"
                >
                  <Shape aria-hidden className="size-6" />
                  {name}
                </li>
              );
            })}
          </ul>
        </Marquee>
      </div>
    </section>
  );
}
