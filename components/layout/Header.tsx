"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "@/lib/nav";
import { useAnchorScroll } from "@/lib/useAnchorScroll";
import { ScrollTrigger } from "@/lib/animations";
import { usePathname } from "@/i18n/navigation";
import { useSectionHref } from "@/lib/useSectionHref";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu, MOBILE_MENU_ID } from "./MobileMenu";

const SCROLL_THRESHOLD = 24;

export function Header() {
  const t = useTranslations("Header");
  const sectionHref = useSectionHref();
  const tc = useTranslations("Common");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const onAnchorClick = useAnchorScroll();

  // Highlight the nav item whose section is in view (homepage only).
  const pathname = usePathname();
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    if (pathname !== "/") return;
    const triggers = NAV_ITEMS.flatMap(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return [];
      return ScrollTrigger.create({
        trigger: el,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => setActiveId((cur) => (self.isActive ? id : cur === id ? null : cur)),
      });
    });
    return () => triggers.forEach((st) => st.kill());
  }, [pathname]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const compact = scrolled && !menuOpen;

  return (
    <>
      {/*
        Compact state uses transform/opacity only: the whole bar slides up
        12px while the blurred cream backdrop fades in behind it.
      */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-(--header-h) transition-transform duration-500 ease-(--ease-out-expo)",
          compact && "-translate-y-3",
        )}
      >
        <div
          aria-hidden
          data-keep-blur
          className={cn(
            "absolute inset-x-0 top-3 bottom-0 border-b border-line bg-cream/80 backdrop-blur-xl backdrop-saturate-150 transition-opacity duration-500",
            compact ? "opacity-100" : "opacity-0",
          )}
        />
        <Container className="relative mt-3 flex h-[68px] items-center justify-between gap-4">
          <Link
            href="/"
            aria-label={tc("homeLabel")}
            className="-mx-1 shrink-0 rounded-md px-1 py-1"
            onClick={closeMenu}
          >
            <Logo />
          </Link>

          <nav aria-label={t("navLabel")} className="hidden lg:block">
            <ul className="flex items-center gap-1 xl:gap-2">
              {NAV_ITEMS.map(({ key, id }) => (
                <li key={key}>
                  <a
                    href={sectionHref(id)}
                    onClick={onAnchorClick}
                    aria-current={activeId === id ? "location" : undefined}
                    className="relative inline-flex h-11 items-center rounded-full px-3 text-[0.9375rem] font-medium text-ink/75 transition-colors hover:text-ink after:absolute after:inset-x-3 after:bottom-2.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-brand after:transition-transform after:duration-300 hover:after:scale-x-100 aria-[current=location]:text-ink aria-[current=location]:after:scale-x-100"
                  >
                    {t(`nav.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher className="hidden md:inline-flex" />
            <Button
              href={sectionHref("kontakt")}
              onClick={onAnchorClick}
              size="sm"
              icon={<ArrowRight className="size-4" />}
              className="hidden sm:inline-flex sm:h-11 sm:px-5"
            >
              {t("cta")}
            </Button>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls={MOBILE_MENU_ID}
              aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
              className="relative inline-flex size-11 items-center justify-center rounded-full border border-ink/15 bg-cream-soft/70 text-ink transition-colors hover:bg-ink hover:text-cream lg:hidden"
            >
              <Menu
                aria-hidden
                className={cn(
                  "absolute size-5 transition-[transform,opacity] duration-300",
                  menuOpen ? "scale-50 rotate-90 opacity-0" : "opacity-100",
                )}
              />
              <X
                aria-hidden
                className={cn(
                  "absolute size-5 transition-[transform,opacity] duration-300",
                  menuOpen ? "opacity-100" : "scale-50 -rotate-90 opacity-0",
                )}
              />
            </button>
          </div>
        </Container>
      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  );
}
