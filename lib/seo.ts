import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";

/** "/" + path for the default locale (no prefix), "/en" + path otherwise. */
export function localePath(locale: Locale, path = "") {
  const clean = path === "/" ? "" : path;
  return locale === routing.defaultLocale ? clean || "/" : `/${locale}${clean}`;
}

/** canonical + hreflang (sr, en, x-default → Serbian) for a page path. */
export function alternatesFor(locale: Locale, path = ""): Metadata["alternates"] {
  return {
    canonical: localePath(locale, path),
    languages: {
      sr: localePath("sr", path),
      en: localePath("en", path),
      "x-default": localePath("sr", path),
    },
  };
}

export const absoluteUrl = (p: string) => `${SITE_URL}${p === "/" ? "" : p}` || SITE_URL;
