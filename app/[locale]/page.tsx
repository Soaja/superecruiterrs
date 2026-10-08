import type { ComponentType } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localePath, absoluteUrl } from "@/lib/seo";
import { CITY_SR, EMAIL, PHONE, SITE_URL, SOCIAL } from "@/lib/site";
import type { Locale } from "@/i18n/routing";
import { Hero } from "@/components/sections/hero/Hero";
import { Comparison } from "@/components/sections/comparison/Comparison";
import { Industries } from "@/components/sections/industries/Industries";
import { Process } from "@/components/sections/process/Process";
import { Network } from "@/components/sections/network/Network";
import { Services } from "@/components/sections/services/Services";
import { Testimonials } from "@/components/sections/testimonials/Testimonials";
import { Contact } from "@/components/sections/contact/Contact";
import { Faq } from "@/components/sections/faq/Faq";

/**
 * Homepage sections, top to bottom. Add new sections to this list.
 */
const SECTIONS: ComponentType[] = [Hero, Comparison, Industries, Process, Network, Services, Testimonials, Faq, Contact];

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Metadata" });

  // Organization / EmploymentAgency structured data (the FAQPage lives in the FAQ section)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EmploymentAgency",
    "@id": `${SITE_URL}/#organization`,
    name: "Superecruiter",
    url: absoluteUrl(localePath(locale as Locale)),
    logo: `${SITE_URL}/icon.svg`, // TODO: real logo URL
    image: absoluteUrl(`${localePath(locale as Locale)}/opengraph-image`.replace("//", "/")),
    description: t("description"),
    telephone: PHONE.href.replace("tel:", ""),
    email: EMAIL,
    inLanguage: locale,
    address: { "@type": "PostalAddress", addressLocality: CITY_SR, addressCountry: "RS" }, // TODO: street address
    areaServed: { "@type": "Country", name: "Serbia" },
    knowsLanguage: ["sr", "en"],
    sameAs: Object.values(SOCIAL).filter((u) => u !== "#"), // TODO: social profiles
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <main id="main" tabIndex={-1} data-inert-when-menu className="outline-none">
        {SECTIONS.map((Section, i) => (
          <Section key={i} />
        ))}
      </main>
    </>
  );
}
