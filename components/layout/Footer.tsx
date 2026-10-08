"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { useLenis } from "lenis/react";
import { ArrowUp, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { FacebookIcon, InstagramIcon, LinkedInIcon } from "@/components/ui/BrandIcons";
import { gsap, useGSAP, EASE, MOTION_QUERIES, prefersReducedMotion } from "@/lib/animations";
import { EMAIL, PHONE, SOCIAL } from "@/lib/site";
import { useAnchorScroll } from "@/lib/useAnchorScroll";
import { useSectionHref } from "@/lib/useSectionHref";
import { cn } from "@/lib/cn";
import { LanguageSwitcher } from "./LanguageSwitcher";

const NAV = [
  ["services", "usluge"],
  ["industries", "industrije"],
  ["process", "kako-radimo"],
  ["network", "mreza"],
  ["references", "reference"],
  ["faq", "faq"],
  ["contact", "kontakt"],
] as const;

const INDUSTRY_LINKS = ["hospitality", "logistics", "construction"] as const;
const WORDMARK = "SUPERECRUITER";

export function Footer() {
  const t = useTranslations("Footer");
  const ti = useTranslations("Contact.industries");
  const tc = useTranslations("Common");
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const sectionHref = useSectionHref();
  const onAnchorClick = useAnchorScroll();
  // Homepage: continues the dark contact section seamlessly. Subpages: rounded
  // top over the cream page.
  const isHome = usePathname() === "/";

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.motion, () => {
        gsap.fromTo(
          "[data-wm-letter]",
          { yPercent: 105 },
          {
            yPercent: 0,
            duration: 1.1,
            ease: EASE.out,
            stagger: 0.045,
            scrollTrigger: { trigger: "[data-wordmark]", start: "top 92%", once: true },
          },
        );
        gsap.fromTo(
          "[data-wm-dot]",
          { scale: 0 },
          {
            scale: 1,
            duration: 0.6,
            ease: "back.out(3)",
            delay: 0.7,
            scrollTrigger: { trigger: "[data-wordmark]", start: "top 92%", once: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const toTop = () => {
    const immediate = prefersReducedMotion();
    if (lenis) lenis.scrollTo(0, { immediate });
    else window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
    document.getElementById("main")?.focus({ preventScroll: true });
  };

  const heading = "mb-4 text-xs font-semibold tracking-[0.14em] text-muted-dark uppercase";
  const link = "inline-flex min-h-11 items-center text-[0.9375rem] text-cream/80 transition-colors hover:text-cream";
  const social = "grid size-11 place-items-center rounded-full border border-white/15 text-cream/80 transition-colors hover:border-brand hover:bg-brand hover:text-ink";

  return (
    <footer
      ref={root}
      data-tone="dark"
      data-inert-when-menu
      className={cn(
        "grain relative z-10 overflow-hidden bg-ink text-cream",
        isHome ? "pt-8" : "-mt-12 rounded-t-section pt-24",
      )}
    >
      <Container>
        {/* Top: 4 columns */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-12">
          <div>
            {/* TODO: swap for the SVG logo (see components/ui/Logo.tsx) */}
            <p className="inline-flex items-baseline font-display text-xl font-bold tracking-[-0.02em] text-cream">
              SUPERECRUITER
              <span aria-hidden className="ml-0.5 inline-block size-[0.32em] rounded-full bg-brand" />
            </p>
            <p className="mt-4 max-w-xs text-[0.9375rem] leading-relaxed text-muted-dark">{t("description")}</p>
            {/* TODO: real social profile URLs (lib/site.ts) */}
            <ul aria-label={t("social")} className="mt-6 flex gap-2">
              <li>
                <a href={SOCIAL.linkedin} aria-label="LinkedIn" className={social}>
                  <LinkedInIcon className="size-4" />
                </a>
              </li>
              <li>
                <a href={SOCIAL.instagram} aria-label="Instagram" className={social}>
                  <InstagramIcon className="size-4" />
                </a>
              </li>
              <li>
                <a href={SOCIAL.facebook} aria-label="Facebook" className={social}>
                  <FacebookIcon className="size-4" />
                </a>
              </li>
            </ul>
          </div>

          <nav aria-label={t("columns.nav")}>
            <p className={heading}>{t("columns.nav")}</p>
            <ul>
              {NAV.map(([key, id]) => (
                <li key={key}>
                  <a href={sectionHref(id)} onClick={onAnchorClick} className={link}>
                    {t(`nav.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t("columns.industries")}>
            <p className={heading}>{t("columns.industries")}</p>
            {/* Anchors for now — will become subpages */}
            <ul>
              {INDUSTRY_LINKS.map((key) => (
                <li key={key}>
                  <a href={sectionHref("industrije")} onClick={onAnchorClick} className={link}>
                    {ti(key)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className={heading}>{t("columns.contact")}</p>
            <ul className="space-y-3 text-[0.9375rem]">
              <li>
                <a href={PHONE.href} className={`${link} inline-flex items-center gap-2.5`}>
                  <Phone aria-hidden className="size-4 text-brand" />
                  {PHONE.display}
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className={`${link} inline-flex items-center gap-2.5`}>
                  <Mail aria-hidden className="size-4 text-brand" />
                  {EMAIL}
                </a>
              </li>
              <li className="inline-flex items-center gap-2.5 text-cream/80">
                <MapPin aria-hidden className="size-4 text-brand" />
                {tc("city")}
              </li>
              <li className="flex items-center gap-2.5 text-cream/80">
                <Clock aria-hidden className="size-4 text-brand" />
                {/* TODO: verify working hours */}
                {t("hours")}
              </li>
            </ul>
          </div>
        </div>

        {/* Huge wordmark — fills the container width via container-query units */}
        <div data-wordmark aria-hidden className="mt-20 [container-type:inline-size] lg:mt-24">
          <p className="flex items-end overflow-hidden pt-[0.06em] font-display text-[12.6cqi] leading-[0.82] font-bold tracking-[-0.045em] whitespace-nowrap text-cream/[0.07] select-none">
            {WORDMARK.split("").map((ch, i) => (
              <span key={i} data-wm-letter className="inline-block">
                {ch}
              </span>
            ))}
            <span data-wm-dot className="mb-[0.1em] ml-[0.04em] inline-block size-[0.16em] shrink-0 rounded-full bg-brand" />
          </p>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col gap-5 border-t border-white/10 py-7 text-[0.8125rem] text-muted-dark lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            <span>{t("copyright", { year: new Date().getFullYear() })}</span>
            {/* TODO: PIB, MB and licence number */}
            <span>{t("pib")}</span>
            <span>{t("mb")}</span>
            <span>{t("license")}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            {/* prefetch off: next-intl "as-needed" + Next 16 segment prefetch
                mis-resolve unprefixed subpages (harmless 404 in the console) */}
            <Link href="/politika-privatnosti" prefetch={false} className="hover:text-cream">
              {t("legal.privacy")}
            </Link>
            <Link href="/uslovi-koriscenja" prefetch={false} className="hover:text-cream">
              {t("legal.terms")}
            </Link>
            <Link href={{ pathname: "/politika-privatnosti", hash: "kolacici" }} prefetch={false} className="hover:text-cream">
              {t("legal.cookies")}
            </Link>
            <LanguageSwitcher className="border-white/15 bg-white/[0.06] [&_a[aria-current]]:bg-cream [&_a[aria-current]]:text-ink [&_a:not([aria-current])]:text-cream/70" />
            <button
              type="button"
              onClick={toTop}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-semibold text-cream transition-colors hover:border-cream hover:bg-cream hover:text-ink"
            >
              {t("toTop")}
              <ArrowUp aria-hidden className="size-4" />
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
}
