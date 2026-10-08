import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

export const alt = "Superecruiter";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Prerender one card per locale at build time.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Social share card in the site's style: cream, wordmark, headline, orange accent. */
export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: loc, namespace: "Metadata" });
  const [bold, medium] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/BricolageGrotesque-700.ttf")),
    readFile(join(process.cwd(), "assets/fonts/BricolageGrotesque-500.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#FFF6EE",
          fontFamily: "Bricolage",
          color: "#1E1814",
          position: "relative",
        }}
      >
        {/* warm accent (plain circles — Satori renders closest-side gradients poorly) */}
        <div style={{ position: "absolute", right: -180, top: -200, width: 620, height: 620, borderRadius: 9999, background: "#FFD9C2", opacity: 0.75 }} />
        <div style={{ position: "absolute", right: -60, top: -80, width: 300, height: 300, borderRadius: 9999, background: "#FF6A1A", opacity: 0.9 }} />
        <div style={{ display: "flex", alignItems: "flex-end", fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
          SUPERECRUITER
          <div style={{ width: 13, height: 13, borderRadius: 9999, background: "#FF6A1A", marginLeft: 4, marginBottom: 9 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3, maxWidth: 900 }}>
            {t("ogHeadline")}
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 32, fontWeight: 500, color: "#6B5E55" }}>{t("ogTagline")}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              background: "#FF6A1A",
              color: "#1E1814",
              fontSize: 28,
              fontWeight: 700,
              padding: "14px 28px",
              borderRadius: 9999,
            }}
          >
            {t("ogBadge")}
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 500, color: "#6B5E55" }}>superecruiter.rs</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage", data: bold, weight: 700, style: "normal" },
        { name: "Bricolage", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
