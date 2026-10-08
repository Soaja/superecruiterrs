/**
 * Minimal analytics bridge: pushes to window.dataLayer so GA4 (via GTM)
 * or Meta Pixel can be wired up later without touching components.
 */
declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}
