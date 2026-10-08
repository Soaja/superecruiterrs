"use client";

import { useCallback } from "react";
import { useLenis } from "lenis/react";
import { prefersReducedMotion } from "./animations";

export const HEADER_OFFSET = 88;

/**
 * Click handler for in-page anchor links (href="#id" or "?key=value#id").
 * Scrolls with Lenis when the target exists on this page; otherwise lets the
 * browser handle the link. Query params are kept in the URL (e.g. the contact
 * form reads ?industrija=… to preselect an industry) and an
 * `anchor-navigate` event is dispatched so sections can react without reload.
 */
export function useAnchorScroll(onNavigate?: () => void) {
  const lenis = useLenis();

  return useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      const url = new URL(event.currentTarget.href);
      const hash = url.hash;
      if (!hash || url.pathname !== window.location.pathname) return;
      const target = document.querySelector<HTMLElement>(hash);
      onNavigate?.();
      if (!target) return;

      event.preventDefault();
      const immediate = prefersReducedMotion();
      if (lenis) {
        lenis.start();
        lenis.scrollTo(target, { offset: -HEADER_OFFSET, immediate });
      } else {
        target.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
      }
      history.replaceState(null, "", url.search + hash);
      window.dispatchEvent(new CustomEvent("anchor-navigate", { detail: { url } }));
      // Move focus for keyboard and screen-reader users.
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    },
    [lenis, onNavigate],
  );
}
