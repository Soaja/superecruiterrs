import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sr", "en"],
  defaultLocale: "sr",
  // Serbian lives at "/", English at "/en".
  localePrefix: "as-needed",
  // Always serve Serbian at "/" regardless of browser language.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
