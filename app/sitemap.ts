import type { MetadataRoute } from "next";
import { absoluteUrl, localePath } from "@/lib/seo";

const PAGES = ["", "/politika-privatnosti", "/uslovi-koriscenja"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((path) =>
    (["sr", "en"] as const).map((locale) => ({
      url: absoluteUrl(localePath(locale, path)),
      changeFrequency: path === "" ? ("weekly" as const) : ("yearly" as const),
      priority: path === "" ? (locale === "sr" ? 1 : 0.9) : 0.2,
      alternates: {
        languages: {
          sr: absoluteUrl(localePath("sr", path)),
          en: absoluteUrl(localePath("en", path)),
          "x-default": absoluteUrl(localePath("sr", path)),
        },
      },
    })),
  );
}
