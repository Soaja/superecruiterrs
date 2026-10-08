import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPlaceholder } from "@/components/layout/LegalPlaceholder";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/uslovi-koriscenja">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Legal" });
  const loc = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  return {
    title: `${t("terms.title")} — Superecruiter`,
    alternates: alternatesFor(loc, "/uslovi-koriscenja"),
    // Placeholder content — keep out of the index until the real text exists.
    robots: { index: false, follow: true },
  };
}

export default async function Page({ params }: PageProps<"/[locale]/uslovi-koriscenja">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPlaceholder page="terms" />;
}
