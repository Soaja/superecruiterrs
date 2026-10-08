"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useLenis } from "lenis/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { gsap, useGSAP, EASE, prefersReducedMotion } from "@/lib/animations";
import { NAV_ITEMS } from "@/lib/nav";
import { useAnchorScroll } from "@/lib/useAnchorScroll";
import { useSectionHref } from "@/lib/useSectionHref";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const MOBILE_MENU_ID = "mobile-menu";

/**
 * Page regions that become `inert` while the menu is open, so keyboard
 * focus stays inside header + menu. Add this attribute to <main>, <footer>…
 */
const INERT_SELECTOR = "[data-inert-when-menu]";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("Header");
  const sectionHref = useSectionHref();
  const lenis = useLenis();
  const rootRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const onAnchorClick = useAnchorScroll(onClose);

  useGSAP(
    () => {
      tlRef.current = gsap
        .timeline({ paused: true })
        .fromTo(rootRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power2.out" })
        .fromTo(
          "[data-menu-link]",
          { yPercent: 110 },
          { yPercent: 0, duration: 0.7, ease: EASE.out, stagger: 0.06 },
          0.1,
        )
        .fromTo(
          "[data-menu-footer]",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: EASE.out },
          0.35,
        );
    },
    { scope: rootRef },
  );

  // Play / reverse, lock scroll, make the page behind inert.
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;

    if (prefersReducedMotion()) {
      tl.progress(open ? 1 : 0).pause();
    } else if (open) {
      tl.timeScale(1).play();
    } else {
      tl.timeScale(1.6).reverse();
    }

    document.querySelectorAll<HTMLElement>(INERT_SELECTOR).forEach((el) => {
      el.inert = open;
    });
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open, lenis]);

  // Escape closes; desktop breakpoint closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => mq.matches && onClose();
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open, onClose]);

  return (
    <div
      ref={rootRef}
      id={MOBILE_MENU_ID}
      aria-hidden={!open}
      className="invisible fixed inset-0 z-40 flex flex-col overflow-y-auto bg-cream pt-(--header-h) opacity-0 lg:hidden"
      data-lenis-prevent
    >
      {/* Decorative warm glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -bottom-32 size-[28rem] rounded-full bg-peach/60 blur-3xl"
      />
      <Container className="relative flex flex-1 flex-col justify-between gap-10 pt-6 pb-8">
        <nav aria-label={t("navLabel")}>
          <ul className="flex flex-col">
            {NAV_ITEMS.map(({ key, id }, i) => (
              <li key={key} className="overflow-hidden border-b border-line">
                <a
                  data-menu-link
                  href={sectionHref(id)}
                  onClick={onAnchorClick}
                  tabIndex={open ? 0 : -1}
                  className="group flex items-baseline gap-4 py-3.5 font-display text-[clamp(2rem,8vw,3rem)] leading-tight font-semibold tracking-[-0.03em] text-ink"
                >
                  <span aria-hidden className="w-7 font-sans text-xs font-medium tracking-normal text-muted tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    {t(`nav.${key}`)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div data-menu-footer className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <LanguageSwitcher className="self-start" />
          <Button
            href={sectionHref("kontakt")}
            onClick={onAnchorClick}
            size="lg"
            tabIndex={open ? 0 : -1}
            icon={<ArrowRight className="size-5" />}
            className="w-full sm:w-auto"
          >
            {t("cta")}
          </Button>
        </div>
      </Container>
    </div>
  );
}
