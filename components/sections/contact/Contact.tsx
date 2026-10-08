"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { glassDark } from "@/components/ui/glass";
import { gsap, useGSAP, MOTION_QUERIES, revealHeading } from "@/lib/animations";
import { cn } from "@/lib/cn";
import { DirectContact } from "./DirectContact";

/** Same footprint as the configurator so swapping it in causes no layout shift. */
function ConfiguratorSkeleton() {
  const bar = "rounded-full bg-white/[0.07] motion-safe:animate-pulse";
  return (
    <div aria-hidden className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-7">
        <div className={cn(glassDark, "min-h-[34rem] rounded-panel p-5 sm:p-8 lg:p-10")}>
          <div className={cn(bar, "h-4 w-32")} />
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i} className={cn(bar, "h-1.5")} />
            ))}
          </div>
          <div className={cn(bar, "mt-10 h-7 w-3/4")} />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-40 rounded-[20px] bg-white/[0.05] motion-safe:animate-pulse" />
            ))}
          </div>
        </div>
      </div>
      <div className="hidden lg:col-span-5 lg:block">
        <div className="min-h-[34rem] rounded-card bg-cream-soft/[0.06]" />
      </div>
    </div>
  );
}

const Configurator = dynamic(() => import("./Configurator").then((m) => m.Configurator), {
  ssr: false,
  loading: () => <ConfiguratorSkeleton />,
});

export function Contact() {
  const t = useTranslations("Contact");
  const root = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  // Mount the configurator (and fetch its chunk) only when the section is
  // near the viewport — or immediately when landing on #kontakt / with params.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "1000px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.motion, () => {
        revealHeading(root.current!);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="kontakt"
      data-tone="dark"
      aria-labelledby="kontakt-title"
      className="grain relative z-10 -mt-12 rounded-t-section bg-ink section-y text-cream"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-t-section">
        <div className="absolute -top-[10%] right-[-15%] size-[60rem] rounded-full bg-[radial-gradient(closest-side,rgb(255_106_26/0.26),transparent)]" />
        <div className="absolute bottom-0 -left-[20%] size-[40rem] rounded-full bg-[radial-gradient(closest-side,rgb(255_217_194/0.06),transparent)]" />
      </div>

      <Container className="relative">
        <SectionHeading id="kontakt-title" reveal tone="dark" eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <div className="mt-12 lg:mt-14">
          {mounted ? (
            <Configurator directContact={<DirectContact />} />
          ) : (
            <>
              <ConfiguratorSkeleton />
              {/* Direct contact is useful even before (or without) JS */}
              <div className="mt-6 lg:hidden">
                <DirectContact />
              </div>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
