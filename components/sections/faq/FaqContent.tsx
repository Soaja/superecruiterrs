"use client";

import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Phone, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { glass } from "@/components/ui/glass";
import { gsap, useGSAP, MOTION_QUERIES, STAGGER, revealHeading, revealOnScroll } from "@/lib/animations";
import { cn } from "@/lib/cn";
import { CONTACT_ANCHOR } from "@/lib/nav";
import { PHONE } from "@/lib/site";
import { useAnchorScroll } from "@/lib/useAnchorScroll";

export type FaqItem = { q: string; a: string };

function ContactCard({ className }: { className?: string }) {
  const t = useTranslations("Faq.contact");
  const onAnchorClick = useAnchorScroll();
  return (
    <div data-faq-rise data-reveal className={cn(glass, "rounded-[24px] p-6", className)}>
      <div className="flex items-center gap-3">
        {/* TODO: consultant photo */}
        <span className="relative grid size-12 place-items-center rounded-full bg-peach text-sm font-bold text-ink">
          SR
          <span className="absolute right-0 bottom-0 size-3 rounded-full bg-emerald-500 ring-2 ring-cream-soft" />
        </span>
        <div>
          <p className="text-xs text-muted">{t("consultant")}</p>
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            {t("available")}
          </p>
        </div>
      </div>
      <p className="mt-5 font-display text-xl font-semibold text-ink">{t("title")}</p>
      <p className="mt-1 text-[0.9375rem] text-muted">{t("text")}</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button href={CONTACT_ANCHOR} onClick={onAnchorClick} icon={<ArrowRight className="size-[1.125rem]" />}>
          {t("primary")}
        </Button>
        <Button href={PHONE.href} variant="ghost" icon={<Phone className="size-4" />}>
          {PHONE.display}
        </Button>
      </div>
    </div>
  );
}

export function FaqContent({ items }: { items: FaqItem[] }) {
  const t = useTranslations("Faq");
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();

  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.motion, () => {
        revealHeading(el);
        revealOnScroll(el.querySelectorAll("[data-faq-item]"), el.querySelector("[data-faq-list]")!, { stagger: STAGGER.items * 0.6 });
        el.querySelectorAll("[data-faq-rise]").forEach((card) => revealOnScroll(card, card));
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="faq" aria-labelledby="faq-title" className="relative section-y">
      <Container className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:sticky lg:top-[120px] lg:col-span-5 lg:self-start">
          <SectionHeading id="faq-title" reveal eyebrow={t("eyebrow")} title={t("title")} />
          <ContactCard className="mt-10 hidden lg:block" />
        </div>

        <div className="lg:col-span-7">
          <ul data-faq-list className="space-y-3">
            {items.map((item, i) => {
              const isOpen = open === i;
              const btnId = `${uid}-q${i}`;
              const panelId = `${uid}-a${i}`;
              return (
                <li
                  key={i}
                  data-faq-item
                  data-reveal
                  className={cn(
                    "relative overflow-hidden rounded-[20px] border transition-[background-color,box-shadow,border-color] duration-500 motion-reduce:transition-none",
                    isOpen ? "border-ink/[0.06] bg-white shadow-soft" : "border-ink/[0.08] bg-cream-soft/60 hover:bg-cream-soft",
                  )}
                >
                  {/* Orange accent bar */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-5 bottom-5 left-0 w-1 origin-top rounded-r-full bg-brand transition-transform duration-500 motion-reduce:transition-none",
                      isOpen ? "scale-y-100" : "scale-y-0",
                    )}
                  />
                  <h3>
                    <button
                      id={btnId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-5 rounded-[20px] px-5 py-5 text-left focus-visible:-outline-offset-4 sm:px-7 sm:py-6"
                    >
                      <span className="font-display text-[1.0625rem] leading-snug font-semibold text-ink sm:text-lg">{item.q}</span>
                      <span
                        aria-hidden
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-full border transition-[rotate,background-color,border-color,color] duration-500 ease-(--ease-out-expo) motion-reduce:transition-none",
                          isOpen ? "rotate-45 border-brand bg-brand text-ink" : "border-ink/15 text-ink",
                        )}
                      >
                        <Plus className="size-4" />
                      </span>
                    </button>
                  </h3>
                  {/* Height animates via the grid-rows 0fr → 1fr trick */}
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={btnId}
                    className={cn(
                      "grid transition-[grid-template-rows,visibility] duration-500 ease-(--ease-out-expo) motion-reduce:transition-none",
                      isOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]",
                    )}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <p className="max-w-[60ch] px-5 pb-6 text-base leading-relaxed text-muted sm:px-7">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <ContactCard className="mt-10 lg:hidden" />
        </div>
      </Container>
    </section>
  );
}
