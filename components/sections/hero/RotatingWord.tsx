"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_QUERIES } from "@/lib/animations";

export type RotatingItem = { pronoun: string; word: string };

const HOLD = 2.2; // seconds each word stays on screen

/**
 * "{prefix} {pronoun} [word]" where [word] sits in an orange pill.
 *
 * Layout never changes: the pill reserves the widest word's width and the
 * visible orange shape is revealed with clip-path. The pronoun slot reserves
 * the longest pronoun ("vaše"); when a shorter one is shown ("vaš") the pill
 * slides left with a transform to close the gap. Only transform, opacity,
 * filter and clip-path are animated.
 */
export function RotatingWord({
  prefix,
  items,
  startDelay = 2,
}: {
  prefix: string;
  items: RotatingItem[];
  startDelay?: number;
}) {
  const root = useRef<HTMLSpanElement>(null);
  const pronouns = [...new Set(items.map((i) => i.pronoun))];

  useGSAP(
    () => {
      const el = root.current!;
      const pill = el.querySelector<HTMLElement>("[data-pill]")!;
      const bg = el.querySelector<HTMLElement>("[data-pill-bg]")!;
      const slot = el.querySelector<HTMLElement>("[data-pronoun-slot]")!;
      const words = gsap.utils.toArray<HTMLElement>("[data-pill-word]", el);
      const pronounEls = gsap.utils.toArray<HTMLElement>("[data-pronoun]", el);
      const pronounIndex = (i: number) => pronouns.indexOf(items[i].pronoun);

      let current = 0;
      let wordW: number[] = [];
      let pronounW: number[] = [];

      const measure = () => {
        wordW = words.map((w) => w.offsetWidth);
        pronounW = pronounEls.map((p) => p.offsetWidth);
      };

      const geometry = (i: number) => {
        const maxWord = Math.max(...wordW);
        const clipRight = maxWord - wordW[i];
        // Only shift when the pill shares a line with the pronoun (on narrow
        // screens the pill may wrap onto its own line).
        const sameLine = Math.abs(pill.offsetTop - slot.offsetTop) < 4;
        const shift = sameLine ? Math.max(...pronounW) - pronounW[pronounIndex(i)] : 0;
        return { clipPath: `inset(0px ${clipRight}px 0px 0px round 999px)`, x: -shift };
      };

      const applyStatic = () => {
        const g = geometry(current);
        gsap.set(bg, { clipPath: g.clipPath });
        gsap.set(pill, { x: g.x });
      };

      measure();
      applyStatic();
      pill.setAttribute("data-ready", ""); // JS geometry in place → drop CSS fallback

      const ro = new ResizeObserver(() => {
        measure();
        applyStatic();
      });
      ro.observe(el.parentElement ?? el);
      document.fonts?.ready.then(() => {
        measure();
        applyStatic();
      });

      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.motion, () => {
        // Steps are created lazily (outside any GSAP context), so they are
        // tracked and killed by hand in the cleanup below.
        let pending: gsap.core.Tween | null = null;
        let tl: gsap.core.Timeline | null = null;

        const step = () => {
          const next = (current + 1) % items.length;
          const g = geometry(next);
          tl = gsap.timeline({
            onComplete: () => {
              pending = gsap.delayedCall(HOLD, step);
            },
          });

          tl.to(words[current], {
            yPercent: -110,
            filter: "blur(6px)",
            autoAlpha: 0,
            duration: 0.45,
            ease: "power2.in",
          })
            .fromTo(
              words[next],
              { yPercent: 110, filter: "blur(6px)", autoAlpha: 0 },
              { yPercent: 0, filter: "blur(0px)", autoAlpha: 1, duration: 0.6, ease: "power3.out" },
              0.3,
            )
            .to(bg, { clipPath: g.clipPath, duration: 0.75, ease: "power3.inOut" }, 0.1)
            .to(pill, { x: g.x, duration: 0.75, ease: "power3.inOut" }, 0.1);

          const from = pronounIndex(current);
          const to = pronounIndex(next);
          if (from !== to) {
            tl.to(pronounEls[from], { autoAlpha: 0, duration: 0.3 }, 0.1).to(
              pronounEls[to],
              { autoAlpha: 1, duration: 0.3 },
              0.35,
            );
          }
          current = next;
        };

        pending = gsap.delayedCall(startDelay, step);

        return () => {
          pending?.kill();
          tl?.kill();
          // Back to the server-rendered state (first word), e.g. when the
          // user switches on reduced motion mid-loop.
          current = 0;
          gsap.set([...words, ...pronounEls], { clearProps: "transform,opacity,visibility,filter" });
          applyStatic();
        };
      });

      return () => {
        ro.disconnect();
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <span ref={root}>
      {prefix}{" "}
      <span data-pronoun-slot className="inline-grid">
        {pronouns.map((p) => (
          <span
            key={p}
            data-pronoun
            className={`col-start-1 row-start-1 justify-self-start ${
              p === items[0].pronoun ? "" : "invisible"
            }`}
          >
            {p}
          </span>
        ))}
      </span>{" "}
      <span
        data-pill
        className="relative -my-[0.04em] inline-grid overflow-hidden px-[0.32em] py-[0.04em] align-baseline text-ink will-change-transform"
      >
        <span
          data-pill-bg
          aria-hidden
          className="absolute inset-0 rounded-full bg-brand"
        />
        {items.map((item, i) => (
          <span
            key={item.word}
            data-pill-word
            className={`relative col-start-1 row-start-1 justify-self-start whitespace-nowrap ${
              i === 0 ? "" : "invisible"
            }`}
          >
            {item.word}
          </span>
        ))}
      </span>
    </span>
  );
}
