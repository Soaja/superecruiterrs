import { useTranslations } from "next-intl";
import { ArrowLeft, FileClock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { glass } from "@/components/ui/glass";
import { EMAIL } from "@/lib/site";

/** Shared "content coming soon" layout for legal pages (TODO: real content). */
export function LegalPlaceholder({ page }: { page: "privacy" | "terms" }) {
  const t = useTranslations("Legal");
  return (
    <main id="main" tabIndex={-1} data-inert-when-menu className="outline-none">
      <Container size="narrow" className="pt-[calc(var(--header-h)+5rem)] pb-40">
        <Eyebrow>Superecruiter</Eyebrow>
        <h1 className="mt-6 text-h1 font-semibold text-ink">{t(`${page}.title`)}</h1>
        <div className={`${glass} mt-10 flex flex-col gap-4 rounded-[24px] p-7 sm:flex-row sm:items-start`}>
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-peach text-brand-deep">
            <FileClock aria-hidden className="size-6" />
          </span>
          <div>
            <p className="font-display text-xl font-semibold text-ink">{t("pending")}</p>
            <p className="mt-1.5 text-muted">
              {t.rich("pendingText", {
                email: EMAIL,
              })}
            </p>
          </div>
        </div>
        {/* Anchor target for the footer "Kolačići" link */}
        <div id="kolacici" />
        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-2 font-semibold text-ink underline-offset-4 hover:underline"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {t("back")}
        </Link>
      </Container>
    </main>
  );
}
