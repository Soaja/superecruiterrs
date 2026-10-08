"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { gsap, ScrollTrigger } from "@/lib/animations";
import { HEADER_OFFSET } from "@/lib/useAnchorScroll";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Drives Lenis from GSAP's ticker and feeds its scroll events to
 * ScrollTrigger. Lives inside the Lenis context and re-binds whenever the
 * instance changes (e.g. StrictMode remounts in dev).
 */
function LenisGsapBridge() {
  const lenis = useLenis(ScrollTrigger.update);

  useEffect(() => {
    if (!lenis) return;
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => gsap.ticker.remove(tick);
  }, [lenis]);

  // Keep trigger positions correct as late content settles: fonts, the
  // window load event and every lazily loaded image (debounced).
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(t);
      t = setTimeout(() => ScrollTrigger.refresh(), 150);
    };
    const onImg = (e: Event) => e.target instanceof HTMLImageElement && refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    document.addEventListener("load", onImg, true); // capture: img load doesn't bubble
    return () => {
      clearTimeout(t);
      window.removeEventListener("load", refresh);
      document.removeEventListener("load", onImg, true);
    };
  }, []);

  // Route / language switch: re-measure, then honour a #hash in the URL
  // (e.g. "/#kontakt" from a subpage) with the sticky-header offset.
  const pathname = usePathname();
  const locale = useLocale();
  useEffect(() => {
    if (!lenis) return;
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (cancelled) return;
      // Font refresh is handled (debounced) by the effect above; only jump if needed.
      const hash = window.location.hash;
      const target = hash.length > 1 ? document.querySelector<HTMLElement>(hash) : null;
      if (!target) return;
      ScrollTrigger.refresh();
      lenis.scrollTo(target, { offset: -HEADER_OFFSET, immediate: true, force: true });
    });
    return () => {
      cancelled = true;
    };
  }, [lenis, pathname, locale]);

  return null;
}

/** Single Lenis instance for the whole app, synced with ScrollTrigger. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const options = useMemo(
    () => ({ autoRaf: false, lerp: 0.1, smoothWheel: !reduced }),
    [reduced],
  );

  return (
    <ReactLenis root options={options}>
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  );
}
