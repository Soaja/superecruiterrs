"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** false during SSR/hydration, true afterwards — without hydration mismatches. */
export function useIsClient() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
