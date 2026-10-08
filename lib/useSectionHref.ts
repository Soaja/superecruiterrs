"use client";

import { useCallback } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Href for a homepage section: "#id" on the homepage, "/#id" (or "/en#id")
 * on subpages so anchors work site-wide.
 */
export function useSectionHref() {
  const pathname = usePathname();
  const locale = useLocale();
  const home = locale === routing.defaultLocale ? "/" : `/${locale}`;
  return useCallback((id: string) => (pathname === "/" ? `#${id}` : `${home}#${id}`), [pathname, home]);
}
