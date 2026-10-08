"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_QUERIES } from "@/lib/animations";

/**
 * Renders a stat string and counts every number in it up from 0 when it
 * scrolls into view ("30–60" → both parts count). Non-numeric placeholders
 * like "XX+" render as-is. SSR / reduced motion show the final value.
 */
export function CountUp({ value, className, duration = 1.6 }: { value: string; className?: string; duration?: number }) {
  const root = useRef<HTMLSpanElement>(null);
  const parts = value.split(/(\d+)/).filter(Boolean);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.motion, () => {
        const nums = gsap.utils.toArray<HTMLElement>("[data-count]", root.current);
        if (!nums.length) return;
        nums.forEach((el) => (el.textContent = "0"));
        const state = nums.map(() => ({ v: 0 }));
        gsap.to(state, {
          v: (i: number) => Number(nums[i].dataset.count),
          duration,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 95%", once: true },
          onUpdate: () => state.forEach((s, i) => (nums[i].textContent = String(Math.round(s.v)))),
        });
        return () => nums.forEach((el) => (el.textContent = el.dataset.count ?? ""));
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <span ref={root} className={className}>
      {/* Screen readers always get the final value */}
      <span className="sr-only">{value}</span>
      <span aria-hidden className="tabular-nums">
        {parts.map((p, i) =>
          /^\d+$/.test(p) ? (
            <span key={i} data-count={p}>
              {p}
            </span>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
      </span>
    </span>
  );
}
