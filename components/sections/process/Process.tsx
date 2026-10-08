"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { glassDark } from "@/components/ui/glass";
import { gsap, useGSAP, EASE, MOTION_QUERIES, ScrollTrigger, loadMotionPath, revealHeading } from "@/lib/animations";
import { cn } from "@/lib/cn";
import { CONTACT_ANCHOR } from "@/lib/nav";
import { PHONE } from "@/lib/site";
import { useAnchorScroll } from "@/lib/useAnchorScroll";
import { useIsClient } from "@/lib/useIsClient";
import { SCENE_KEYS, Scene, buildSceneTimeline } from "./Scenes";

const TOTAL = SCENE_KEYS.length;
const HEADER = 80; // px — matches --header-h
const DESKTOP_MOTION = `${MOTION_QUERIES.motion} and (min-width: 1024px)`;
const MOBILE_MOTION = `${MOTION_QUERIES.motion} and (max-width: 1023px)`;

const num = (i: number) => String(i + 1).padStart(2, "0");

/** Large outlined number that fills orange when active. */
function StepNumber({ i, filled, className }: { i: number; filled: boolean; className?: string }) {
  return (
    <span aria-hidden className={cn("relative inline-block font-display leading-none font-bold tracking-[-0.04em]", className)}>
      <span className="text-transparent [-webkit-text-stroke:1.5px_var(--brand)]">{num(i)}</span>
      <span
        className={cn(
          "absolute inset-0 text-brand transition-opacity duration-500",
          filled ? "opacity-100" : "opacity-0",
        )}
      >
        {num(i)}
      </span>
    </span>
  );
}

export function Process() {
  const t = useTranslations("Process");
  const root = useRef<HTMLElement>(null);
  const onAnchorClick = useAnchorScroll();
  const [active, setActive] = useState(0);
  // The 12 scene mocks (desktop stage + mobile list) are decorative and
  // aria-hidden, so they render on the client only — keeps ~a third of the
  // page's HTML off the critical path. Containers reserve their size.
  const isClient = useIsClient();

  useGSAP(
    () => {
      // Wait for the client-only scene mocks before wiring timelines to them.
      if (!isClient) return;
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add(MOTION_QUERIES.motion, () => {
        revealHeading(el);
        void loadMotionPath(); // for the boarding-pass plane (scene 5)
      });

      // ---------- Desktop: pinned stage + scroll-driven scenes ----------
      mm.add(DESKTOP_MOTION, () => {
        const grid = q("[data-proc-grid]")[0];
        const pinEl = q("[data-proc-pin]")[0];
        const layers = q("[data-scene-layer]") as HTMLElement[];
        let current = 0;
        let sceneTl: gsap.core.Timeline | null = null;
        let swap: gsap.core.Timeline | null = null;

        const sceneOf = (i: number) => layers[i].querySelector<HTMLElement>("[data-scene]")!;
        // Prime scene 1 in its "before" state so it doesn't flash its final state.
        sceneTl = buildSceneTimeline(SCENE_KEYS[0], sceneOf(0)).pause(0);

        const goTo = (i: number) => {
          setActive(i);
          if (i !== current) {
            swap?.kill();
            const prev = current;
            current = i;
            layers.forEach((layer, j) => j !== i && j !== prev && gsap.set(layer, { autoAlpha: 0 }));
            swap = gsap
              .timeline()
              .to(layers[prev], { autoAlpha: 0, y: -24, scale: 0.97, duration: 0.4, ease: "power2.in" })
              .fromTo(
                layers[i],
                { autoAlpha: 0, y: 28, scale: 0.97 },
                { autoAlpha: 1, y: 0, scale: 1, duration: 0.65, ease: EASE.out },
                0.2,
              );
          }
          sceneTl?.kill();
          sceneTl = buildSceneTimeline(SCENE_KEYS[i], sceneOf(i)).delay(0.25);
        };

        ScrollTrigger.create({
          trigger: pinEl,
          start: `top top+=${HEADER}`,
          endTrigger: grid,
          end: "bottom bottom",
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
        });

        gsap.fromTo(
          q("[data-proc-fill]"),
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: q("[data-proc-steps]")[0], start: "top center", end: "bottom center", scrub: true },
          },
        );

        (q("[data-proc-step]") as HTMLElement[]).forEach((step, i) =>
          ScrollTrigger.create({
            trigger: step,
            start: "top center",
            end: "bottom center",
            onToggle: (self) => self.isActive && goTo(i),
          }),
        );

        return () => {
          sceneTl?.kill();
          swap?.kill();
        };
      });

      // ---------- Mobile / tablet: inline scenes play on enter ----------
      mm.add(MOBILE_MOTION, () => {
        gsap.fromTo(
          q("[data-proc-mfill]"),
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: q("[data-proc-mlist]")[0], start: "top 70%", end: "bottom 70%", scrub: true },
          },
        );
        (q("[data-mscene]") as HTMLElement[]).forEach((card, i) => {
          const tl = buildSceneTimeline(SCENE_KEYS[i], card.querySelector<HTMLElement>("[data-scene]")!).pause(0);
          ScrollTrigger.create({ trigger: card, start: "top 75%", once: true, onEnter: () => void tl.play() });
        });
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [isClient], revertOnUpdate: true },
  );

  return (
    <section
      ref={root}
      id="kako-radimo"
      data-tone="dark"
      aria-labelledby="kako-radimo-title"
      className="grain relative z-10 -mt-12 rounded-section bg-ink section-y text-cream"
    >
      {/* Warm glow (clipped to the section's rounded box) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-section">
        <div className="absolute top-[18%] -right-[12%] size-[56rem] rounded-full bg-[radial-gradient(closest-side,rgb(255_106_26/0.28),transparent)]" />
        <div className="absolute -top-40 left-[10%] size-[30rem] rounded-full bg-[radial-gradient(closest-side,rgb(255_217_194/0.08),transparent)]" />
      </div>

      <Container className="relative">
        <SectionHeading
          id="kako-radimo-title"
          reveal
          tone="dark"
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        {/* ================= Desktop (≥1024, motion allowed) ================= */}
        <div
          data-proc-grid
          className="mt-16 hidden grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)] gap-12 lg:motion-safe:grid xl:gap-20"
        >
          <div className="relative">
            {/* progress line */}
            <div aria-hidden className="absolute top-[10vh] bottom-[24vh] left-[7px] w-0.5 rounded-full bg-white/10">
              <div data-proc-fill className="size-full origin-top rounded-full bg-brand" />
            </div>
            <ol data-proc-steps aria-label={t("stepsLabel")} className="pt-[10vh] pb-[24vh]">
              {SCENE_KEYS.map((key, i) => {
                const isActive = i === active;
                return (
                  <li
                    key={key}
                    data-proc-step
                    aria-current={isActive ? "step" : undefined}
                    className="relative flex min-h-[70vh] items-center pl-14"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "absolute top-1/2 left-0 size-4 -translate-y-1/2 rounded-full border-2 transition-[background-color,border-color,box-shadow] duration-500",
                        i <= active
                          ? "border-brand bg-brand shadow-[0_0_0_6px_rgb(255_106_26/0.18)]"
                          : "border-white/25 bg-ink",
                      )}
                    />
                    {/* Inactive steps dim via colour (not opacity) so text stays AA-legible */}
                    <div>
                      <StepNumber
                        i={i}
                        filled={isActive}
                        className={cn("text-[5.5rem] transition-opacity duration-500", isActive ? "opacity-100" : "opacity-40")}
                      />
                      <h3
                        className={cn(
                          "mt-4 text-h3 font-semibold transition-colors duration-500",
                          isActive ? "text-cream" : "text-cream/55",
                        )}
                      >
                        {t(`steps.${key}.title`)}
                      </h3>
                      <p
                        className={cn(
                          "mt-3 max-w-md text-lead transition-colors duration-500",
                          isActive ? "text-muted-dark" : "text-muted-dark/75",
                        )}
                      >
                        {t(`steps.${key}.text`)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div data-proc-pin className="flex h-[calc(100svh-var(--header-h))] items-center justify-center self-start">
            <div className="relative aspect-[4/5] h-[min(74svh,680px)]">
              <div className={cn(glassDark, "absolute inset-0 overflow-hidden rounded-panel")}>
                <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgb(255_106_26/0.12),transparent_60%)]" />
                {SCENE_KEYS.map((key, i) => (
                  <div
                    key={key}
                    aria-hidden
                    data-scene-layer
                    className={cn("absolute inset-0 grid place-items-center p-8 xl:p-10", i > 0 && "invisible opacity-0")}
                  >
                    <div data-scene className="grid w-full place-items-center">
                      {isClient && <Scene name={key} />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Persistent "Step X of 6" mini card */}
              <div aria-hidden className={cn(glassDark, "absolute bottom-10 -left-10 w-52 p-4 xl:-left-14")}>
                <p className="text-xs font-medium text-muted-dark">
                  {t("stepOf", { current: active + 1, total: TOTAL })}
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-cream">
                  {t(`steps.${SCENE_KEYS[active]}.title`)}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full origin-left rounded-full bg-brand transition-transform duration-500 ease-(--ease-out-expo)"
                    style={{ transform: `scaleX(${(active + 1) / TOTAL})` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============ Mobile / tablet / reduced motion: inline timeline ============ */}
        <div className="relative mt-14 lg:motion-safe:hidden">
          <div aria-hidden className="absolute top-2 bottom-2 left-[7px] w-0.5 rounded-full bg-white/10">
            <div data-proc-mfill className="size-full origin-top rounded-full bg-brand" />
          </div>
          <ol data-proc-mlist aria-label={t("stepsLabel")} className="space-y-16 sm:space-y-20">
            {SCENE_KEYS.map((key, i) => (
              <li key={key} className="relative pl-8 sm:pl-14">
                <span aria-hidden className="absolute top-3 left-0 size-4 rounded-full border-2 border-brand bg-ink" />
                <StepNumber i={i} filled className="text-5xl sm:text-6xl" />
                <h3 className="mt-3 text-h3 font-semibold text-cream">{t(`steps.${key}.title`)}</h3>
                <p className="mt-2 max-w-xl text-[1.0625rem] leading-relaxed text-muted-dark">{t(`steps.${key}.text`)}</p>
                <div
                  aria-hidden
                  data-mscene
                  className={cn(glassDark, "relative mt-6 grid min-h-[24rem] place-items-center overflow-hidden rounded-card px-4 py-10 sm:px-10")}
                >
                  <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgb(255_106_26/0.12),transparent_60%)]" />
                  <div data-scene className="relative grid w-full place-items-center">
                    {isClient && <Scene name={key} />}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* ================= CTA ================= */}
        <div className="mt-24 flex flex-col items-center text-center lg:mt-28">
          <h3 className="text-h2 font-semibold text-cream">{t("cta.title")}</h3>
          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Button
              href={CONTACT_ANCHOR}
              onClick={onAnchorClick}
              size="lg"
              icon={<ArrowRight className="size-5" />}
              className="w-full sm:w-auto"
            >
              {t("cta.primary")}
            </Button>
            <Button
              href={PHONE.href}
              size="lg"
              variant="outlineLight"
              icon={<Phone className="size-[1.125rem]" />}
              className="w-full sm:w-auto"
            >
              {t("cta.call", { phone: PHONE.display })}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
