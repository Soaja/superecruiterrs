"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };

/**
 * MotionPathPlugin is only needed by two below-the-fold animations (the
 * plane and the network map dots), so it loads on demand — registered once.
 */
let motionPath: Promise<void> | null = null;
let motionPathReady = false;
export function loadMotionPath() {
  motionPath ??= import("gsap/MotionPathPlugin").then(({ MotionPathPlugin }) => {
    gsap.registerPlugin(MotionPathPlugin);
    motionPathReady = true;
  });
  return motionPath;
}
export const isMotionPathReady = () => motionPathReady;

/** Shared motion language — keep every section on the same rhythm. */
export const EASE = {
  out: "power3.out",
  inOut: "power3.inOut",
  soft: "power2.out",
} as const;

export const DURATION = {
  fast: 0.4,
  base: 0.8,
  slow: 1.2,
} as const;

/** Stagger rhythm shared by the hero and section headings. */
export const STAGGER = {
  lines: 0.12,
  words: 0.045,
  items: 0.1,
} as const;

/** gsap.matchMedia conditions used across sections. */
export const MOTION_QUERIES = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOTION_QUERIES.reduced).matches;
}

/**
 * Reveals animate `opacity` (never `autoAlpha`/visibility) so content stays
 * in the accessibility tree before it is revealed.
 *
 * Fade-and-rise reveal for any set of elements when they enter the
 * viewport. Call inside useGSAP so cleanup is automatic.
 */
export function revealOnScroll(
  targets: gsap.TweenTarget,
  trigger: Element,
  vars: gsap.TweenVars = {},
  distance = 32,
) {
  return gsap.fromTo(
    targets,
    { opacity: 0, y: distance },
    {
      opacity: 1,
      y: 0,
      duration: DURATION.base,
      ease: EASE.out,
      stagger: 0.08,
      scrollTrigger: { trigger, start: "top 80%", once: true },
      ...vars,
    },
  );
}

/**
 * Reveals a <SectionHeading reveal /> inside `scope` when `trigger` enters:
 * eyebrow → title words (clipped slide-up, hero rhythm) → subtitle.
 * Call inside a gsap.matchMedia motion block in useGSAP.
 */
export function revealHeading(scope: Element, trigger: Element = scope) {
  const q = gsap.utils.selector(scope);
  const tl = gsap.timeline({
    defaults: { ease: EASE.out },
    scrollTrigger: { trigger, start: "top 80%", once: true },
  });
  // Only tween parts that exist (not every heading has an eyebrow/subtitle).
  const eyebrow = q("[data-heading-eyebrow]");
  const title = q("[data-heading-title]");
  const words = q("[data-heading-word]");
  const sub = q("[data-heading-sub]");
  if (eyebrow.length) tl.fromTo(eyebrow, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, 0);
  if (title.length) tl.set(title, { opacity: 1 }, 0.05);
  if (words.length) tl.fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: STAGGER.words }, 0.05);
  if (sub.length) tl.fromTo(sub, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.45);
  return tl;
}

/** Card/panel entrance: scale from 0.96 + fade when it enters the viewport. */
export function scaleIn(
  target: gsap.TweenTarget,
  trigger: Element,
  vars: gsap.TweenVars = {},
  from: gsap.TweenVars = {},
) {
  return gsap.fromTo(
    target,
    { opacity: 0, scale: 0.96, y: 24, ...from },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: DURATION.slow,
      ease: EASE.out,
      scrollTrigger: { trigger, start: "top 80%", once: true },
      ...vars,
    },
  );
}

/** Rows/lines wipe up from the bottom (clip-path) with a stagger on enter. */
export function revealClip(targets: gsap.TweenTarget, trigger: Element, vars: gsap.TweenVars = {}) {
  return gsap.fromTo(
    targets,
    { clipPath: "inset(100% 0% 0% 0%)", y: 24, opacity: 0 },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      y: 0,
      opacity: 1,
      duration: 1,
      ease: EASE.out,
      stagger: STAGGER.items,
      scrollTrigger: { trigger, start: "top 80%", once: true },
      ...vars,
    },
  );
}
