import { useTranslations } from "next-intl";
import { FaqContent, type FaqItem } from "./FaqContent";

/**
 * FAQ section. Server component so the FAQPage JSON-LD (SEO) is in the
 * initial HTML; the interactive accordion lives in FaqContent.
 */
export function Faq() {
  const t = useTranslations("Faq");
  // TODO: verify answer 6 (employer obligations) with the client.
  const items = t.raw("items") as FaqItem[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <FaqContent items={items} />
    </>
  );
}
