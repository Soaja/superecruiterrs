import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { alternatesFor, localePath } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "../globals.css";

// latin-ext covers Serbian Latin: č ć ž š đ (preloaded: the SR page needs it
// immediately; preloading only "latin" made those glyphs swap in late).
const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: "#FFF6EE" };

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const loc = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: loc, namespace: "Metadata" });
  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    applicationName: "Superecruiter",
    alternates: alternatesFor(loc),
    openGraph: {
      type: "website",
      siteName: "Superecruiter",
      title: t("title"),
      description: t("description"),
      url: localePath(loc),
      locale: loc === "sr" ? "sr_RS" : "en_US",
      alternateLocale: loc === "sr" ? ["en_US"] : ["sr_RS"],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Common" });

  return (
    <html
      lang={locale}
      className={`${bricolage.variable} ${inter.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-cream text-ink">
        <NextIntlClientProvider>
          <SmoothScroll>
            <a
              href="#main"
              className="fixed top-3 left-3 z-[60] -translate-y-24 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-cream transition-transform focus-visible:translate-y-0"
            >
              {t("skipToContent")}
            </a>
            <Header />
            {children}
            <Footer />
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
