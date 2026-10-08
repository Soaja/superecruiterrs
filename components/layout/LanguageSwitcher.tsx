"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/cn";

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("Header");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div
      role="group"
      aria-label={t("languageLabel")}
      className={cn(
        "inline-flex items-center rounded-full border border-ink/10 bg-cream-soft/70 p-1",
        className,
      )}
    >
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <Link
            key={l}
            href={pathname}
            locale={l}
            lang={l}
            hrefLang={l}
            aria-current={active ? "true" : undefined}
            scroll={false}
            className={cn(
              // before: invisible 44px hit area around the compact 32px pill
              "relative inline-flex h-8 min-w-10 items-center justify-center rounded-full px-2.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-300 before:absolute before:-inset-1.5 before:content-['']",
              active ? "bg-ink text-cream" : "text-muted hover:text-ink",
            )}
          >
            {l}
            {/* Accessible name keeps the visible "SR"/"EN" (WCAG 2.5.3) */}
            <span className="sr-only"> — {t(`languages.${l}`)}</span>
          </Link>
        );
      })}
    </div>
  );
}
