"use client";

import { useSyncExternalStore } from "react";
import { MOTION_QUERIES } from "./animations";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(MOTION_QUERIES.reduced);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** Live `prefers-reduced-motion: reduce` flag (false during SSR). */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOTION_QUERIES.reduced).matches,
    () => false,
  );
}
