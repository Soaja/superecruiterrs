"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { gsap, useGSAP, MOTION_QUERIES, ScrollTrigger, revealClip, revealHeading } from "@/lib/animations";
import { CONTACT_ANCHOR } from "@/lib/nav";
import { useAnchorScroll } from "@/lib/useAnchorScroll";
import { SERVICES } from "./data";



const CURSOR_QUERY = `${MOTION_QUERIES.motion} and (min-width: 1024px) and (pointer: fine)`;

export function Services() {
  const t = useTranslations("Services");
  const root = useRef<HTMLElement>(null);
  const onAnchorClick = useAnchorScroll();
  // The cursor card is fixed at the viewport origin, so its <img>s would load
  // immediately; mount them only once the list approaches the viewport.
  const [cursorImgs, setCursorImgs] = useState(false);

  useGSAP(
    () => {
      const el = root.current!;
      const list = el.querySelector<HTMLElement>("[data-svc-list]")!;
      const mm = gsap.matchMedia();

      mm.add(MOTION_QUERIES.motion, () => {
        revealHeading(el);
        revealClip(el.querySelectorAll("[data-svc-row]"), list);
      });

      // Cursor-following photo card (desktop + mouse only)
      mm.add(CURSOR_QUERY, () => {
        ScrollTrigger.create({ trigger: list, start: "top bottom+=400", once: true, onEnter: () => setCursorImgs(true) });
        const card = el.querySelector<HTMLElement>("[data-cursor-card]")!;
        const imgs = () => gsap.utils.toArray<HTMLElement>("[data-cursor-img]", card);
        gsap.set(card, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.8 });
        const xTo = gsap.quickTo(card, "x", { duration: 0.65, ease: "power3.out" });
        const yTo = gsap.quickTo(card, "y", { duration: 0.65, ease: "power3.out" });
        const rTo = gsap.quickTo(card, "rotation", { duration: 0.8, ease: "power3.out" });
        let visible = false;
        let current = -1;

        const onMove = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          xTo(e.clientX);
          yTo(e.clientY);
        };
        const enterRow = (i: number, e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          if (!visible) {
            // Appear at the cursor instead of flying in from the last position
            gsap.set(card, { x: e.clientX, y: e.clientY, rotation: SERVICES[i].tilt });
            xTo(e.clientX, e.clientX);
            yTo(e.clientY, e.clientY);
            gsap.to(card, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)", overwrite: "auto" });
            visible = true;
          }
          if (current !== i) {
            imgs().forEach((img, j) => gsap.to(img, { autoAlpha: j === i ? 1 : 0, duration: 0.35, overwrite: "auto" }));
            rTo(SERVICES[i].tilt);
            current = i;
          }
        };
        const leave = () => {
          visible = false;
          gsap.to(card, { autoAlpha: 0, scale: 0.8, duration: 0.3, ease: "power2.in", overwrite: "auto" });
        };

        const rows = gsap.utils.toArray<HTMLElement>("[data-svc-row]", list);
        const rowHandlers = rows.map((row, i) => {
          const h = (e: PointerEvent) => enterRow(i, e);
          row.addEventListener("pointerenter", h);
          return h;
        });
        list.addEventListener("pointermove", onMove);
        list.addEventListener("pointerleave", leave);
        return () => {
          rows.forEach((row, i) => row.removeEventListener("pointerenter", rowHandlers[i]));
          list.removeEventListener("pointermove", onMove);
          list.removeEventListener("pointerleave", leave);
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="usluge" aria-labelledby="usluge-title" className="relative section-y">
      <Container className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:sticky lg:top-32 lg:col-span-5 lg:self-start">
          <SectionHeading id="usluge-title" reveal eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
        </div>

        <ul data-svc-list aria-label={t("listLabel")} className="border-t border-[#EADBCD] lg:col-span-7">
          {SERVICES.map((s, i) => (
            <li key={s.key} data-svc-row data-reveal>
              <a
                href={`?usluga=${s.slug}${CONTACT_ANCHOR}`}
                onClick={onAnchorClick}
                className="group relative grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-[#EADBCD] py-5 focus-visible:-outline-offset-2 sm:py-6 lg:grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,13rem)_2.75rem] lg:gap-6 lg:py-7"
              >
                <span className="self-start pt-2 text-sm font-semibold text-muted tabular-nums lg:self-center lg:pt-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[clamp(1.625rem,1.15rem+1.9vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.025em] text-ink transition-[translate,color] duration-500 ease-(--ease-out-expo) group-hover:translate-x-3 group-hover:text-brand-hover group-focus-visible:translate-x-3 group-focus-visible:text-brand-hover motion-reduce:transition-none">
                    {t(`items.${s.key}.title`)}
                  </span>
                  <span className="mt-1.5 block text-base leading-relaxed text-muted lg:hidden">
                    {t(`items.${s.key}.text`)}
                  </span>
                </span>
                <span className="hidden text-sm leading-relaxed text-muted lg:block">{t(`items.${s.key}.text`)}</span>

                {/* Mobile thumbnail */}
                <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-peach sm:size-20 lg:hidden">
                  <Image src={s.photo} alt="" fill sizes="80px" className="object-cover" />
                </span>
                {/* Desktop arrow */}
                <span
                  aria-hidden
                  className="hidden size-11 place-items-center rounded-full border border-ink/15 text-ink transition-[rotate,background-color,color,border-color] duration-500 ease-(--ease-out-expo) group-hover:rotate-45 group-hover:border-ink group-hover:bg-ink group-hover:text-cream group-focus-visible:rotate-45 lg:grid"
                >
                  <ArrowUpRight className="size-5" />
                </span>

                {/* Growing orange underline */}
                <span
                  aria-hidden
                  className="absolute -bottom-px left-0 h-px w-full origin-left scale-x-0 bg-brand transition-transform duration-700 ease-(--ease-out-expo) group-hover:scale-x-100 group-focus-visible:scale-x-100"
                />
              </a>
            </li>
          ))}
        </ul>
      </Container>

      {/* Cursor-following photo (desktop) */}
      <div
        aria-hidden
        data-cursor-card
        className="pointer-events-none invisible fixed top-0 left-0 z-30 hidden h-[200px] w-[280px] overflow-hidden rounded-[20px] bg-peach opacity-0 shadow-lift lg:block"
      >
        {cursorImgs &&
          SERVICES.map((s, i) => (
            <div key={s.key} data-cursor-img className={i === 0 ? "absolute inset-0" : "invisible absolute inset-0 opacity-0"}>
              <Image src={s.photo} alt="" fill sizes="280px" className="object-cover" />
            </div>
          ))}
      </div>
    </section>
  );
}
