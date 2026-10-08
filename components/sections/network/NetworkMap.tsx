"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Flag } from "@/components/ui/Flag";
import { glass } from "@/components/ui/glass";
import { gsap, useGSAP, EASE, MOTION_QUERIES, ScrollTrigger, loadMotionPath, prefersReducedMotion } from "@/lib/animations";
import { cn } from "@/lib/cn";
import { MAP_CITIES, MAP_DOTS_SRC, MAP_VIEWBOX } from "@/lib/map-data";
import { CONTACT_ANCHOR } from "@/lib/nav";
import { useAnchorScroll } from "@/lib/useAnchorScroll";
import { DEFAULT_COUNTRY, NETWORK, type NetworkCountry } from "./data";

const AUTO_CYCLE = 4; // s, until the first interaction
const { width: W, height: H } = MAP_VIEWBOX;
const HQ = MAP_CITIES.belgrade;
const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(3)}%`;

/** Quadratic arc city → Belgrade; positive bend bows toward the top of the map. */
function arcPath({ city, bend }: NetworkCountry) {
  const from = MAP_CITIES[city];
  const dx = HQ.x - from.x;
  const dy = HQ.y - from.y;
  const len = Math.hypot(dx, dy);
  let nx = -dy / len;
  let ny = dx / len;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const cx = (from.x + HQ.x) / 2 + nx * len * bend;
  const cy = (from.y + HQ.y) / 2 + ny * len * bend;
  return `M${from.x} ${from.y}Q${cx.toFixed(2)} ${cy.toFixed(2)} ${HQ.x} ${HQ.y}`;
}

const ARCS = NETWORK.map(arcPath);

/** Place the floating card away from Belgrade (arcs run up-left) and inside the tile. */
function cardPlacement(i: number) {
  const { x, y } = MAP_CITIES[NETWORK[i].city];
  const right = x / W < 0.6;
  const below = y / H < 0.6;
  return {
    style: { left: pct(x, W), top: pct(y, H) },
    className: cn(right ? "translate-x-5" : "-translate-x-[calc(100%+1.25rem)]", below ? "translate-y-3" : "-translate-y-[calc(100%+0.75rem)]"),
  };
}

function InfoCard({ index, className }: { index: number; className?: string }) {
  const t = useTranslations("Network");
  const tp = useTranslations("Hero.partners.countries");
  const onAnchorClick = useAnchorScroll();
  const { code } = NETWORK[index];
  // TODO: profiles & languages are placeholders — verify with the client.
  const profiles = tp(`${code}.profiles`).split(", ");

  return (
    <div data-info-card className={cn(glass, "w-full p-4 sm:w-[16.5rem]", className)}>
      <div className="flex items-center gap-2.5">
        <Flag code={code} />
        <p className="text-sm font-semibold text-ink">
          {t(`countries.${code}.name`)} <span className="font-normal text-muted">· {t(`countries.${code}.city`)}</span>
        </p>
      </div>
      <p className="mt-3 text-[0.6875rem] font-semibold tracking-wide text-muted uppercase">{t("map.profilesLabel")}</p>
      <ul className="mt-1.5 flex flex-wrap gap-1.5">
        {profiles.map((p) => (
          <li key={p} className="rounded-full bg-peach/70 px-2.5 py-1 text-xs font-medium text-ink first-letter:uppercase">
            {p}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">
        <span className="font-semibold text-ink">{t("map.languagesLabel")}</span> {t(`countries.${code}.languages`)}
      </p>
      <a
        href={`?zemlja=${code}${CONTACT_ANCHOR}`}
        onClick={onAnchorClick}
        className="group mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-deep"
      >
        {t("map.request", { from: t(`countries.${code}.from`) })}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </a>
    </div>
  );
}

export function NetworkMap() {
  const t = useTranslations("Network");
  const root = useRef<HTMLDivElement>(null);
  const chips = useRef<(HTMLButtonElement | null)[]>([]);
  const [selected, setSelected] = useState(DEFAULT_COUNTRY);
  const interacted = useRef(false);
  const cycle = useRef<gsap.core.Tween | null>(null);
  const firstRun = useRef(true);

  const choose = (i: number) => {
    interacted.current = true;
    cycle.current?.kill();
    setSelected(i);
  };

  const onChipKey = (e: KeyboardEvent, i: number) => {
    const n = NETWORK.length;
    const next = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    chips.current[next]?.focus();
    choose(next);
  };

  // Arcs draw in, dots travel, auto-cycle while in view.
  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.motion, () => {
        const arcs = gsap.utils.toArray<SVGPathElement>("[data-arc]", el);
        const travellers = gsap.utils.toArray<SVGGElement>("[data-traveller]", el);
        const loops: gsap.core.Timeline[] = []; // created async → killed manually
        let alive = true;
        void loadMotionPath(); // prefetch while the arcs draw

        gsap
          .timeline({ scrollTrigger: { trigger: el, start: "top 75%", once: true } })
          .fromTo(arcs, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, stagger: 0.14, ease: "power2.inOut" })
          .fromTo("[data-city]", { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.5, stagger: 0.08, ease: "back.out(2.5)" }, 0)
          .add(() => {
            void loadMotionPath().then(() => {
              if (!alive) return;
              travellers.forEach((g, i) => {
                const path = arcs[i];
                const motion = { path, align: path, alignOrigin: [0.5, 0.5] as [number, number] };
                const loop = gsap
                  .timeline({ repeat: -1, repeatDelay: 1.4 + (i % 3) * 0.5, delay: i * 0.65 })
                  .fromTo(
                    g,
                    { motionPath: { ...motion, start: 0, end: 0 } },
                    { motionPath: { ...motion, start: 0, end: 1 }, duration: 3.2 + (i % 2) * 0.6, ease: "power1.inOut" },
                  )
                  .fromTo(g, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
                  .to(g, { opacity: 0, duration: 0.4 }, ">-0.4");
                loops.push(loop);
              });
            });
          });

        const schedule = () => {
          cycle.current?.kill();
          if (interacted.current) return;
          cycle.current = gsap.delayedCall(AUTO_CYCLE, () => {
            if (interacted.current) return;
            setSelected((s) => (s + 1) % NETWORK.length);
            schedule();
          });
        };
        const st = ScrollTrigger.create({
          trigger: el,
          start: "top 70%",
          end: "bottom 30%",
          onToggle: (self) => (self.isActive ? schedule() : cycle.current?.kill()),
        });
        return () => {
          alive = false;
          loops.forEach((l) => l.kill());
          st.kill();
          cycle.current?.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Info card swap
  useGSAP(
    () => {
      if (firstRun.current || prefersReducedMotion()) {
        firstRun.current = false;
        return;
      }
      gsap.fromTo(
        "[data-info-card]",
        { autoAlpha: 0, y: 10, scale: 0.97 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: EASE.out },
      );
    },
    { scope: root, dependencies: [selected] },
  );

  const placement = cardPlacement(selected);

  return (
    <div ref={root} className="relative flex h-full flex-col">
      {/* Tile header */}
      <div className="relative z-10 px-5 pt-5 sm:absolute sm:top-0 sm:left-0 sm:px-7 sm:pt-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">{t("map.label")}</p>
        <p className="font-display text-2xl font-semibold text-ink">{t("map.count")}</p>
      </div>

      {/* Map */}
      <div className="relative mx-auto mt-2 w-full max-w-[60rem] px-2 sm:mt-10 sm:px-6 lg:mt-12">
        <div className="relative w-full" style={{ aspectRatio: `${W} / ${H}` }}>
          {/* Static dotted continents (lazy, cached); arcs/markers are inline SVG on top */}
          {/* eslint-disable-next-line @next/next/no-img-element -- plain SVG, nothing for next/image to optimise */}
          <img src={MAP_DOTS_SRC} alt="" aria-hidden loading="lazy" decoding="async" className="absolute inset-0 size-full" />
          <svg viewBox={`0 0 ${W} ${H}`} aria-hidden className="absolute inset-0 size-full overflow-visible">

            {NETWORK.map((c, i) => (
              <g
                key={c.code}
                className={cn("transition-opacity duration-500", i === selected ? "opacity-100" : "opacity-20")}
              >
                <path d={ARCS[i]} fill="none" stroke="var(--ink)" strokeOpacity={0.12} strokeWidth={0.22} strokeDasharray="0.15 0.6" strokeLinecap="round" />
                <path
                  data-arc
                  d={ARCS[i]}
                  pathLength={1}
                  fill="none"
                  stroke="var(--brand)"
                  strokeWidth={i === selected ? 0.42 : 0.3}
                  strokeLinecap="round"
                  strokeDasharray="1"
                />
                <g data-traveller opacity={0}>
                  <circle r={1.1} fill="var(--brand)" opacity={0.25} />
                  <circle r={0.48} fill="var(--brand)" />
                </g>
              </g>
            ))}

            {NETWORK.map((c, i) => {
              const { x, y } = MAP_CITIES[c.city];
              const on = i === selected;
              return (
                <g key={c.code} data-city className="cursor-pointer" onClick={() => choose(i)}>
                  <circle cx={x} cy={y} r={2.4} fill="transparent" />
                  <circle className="city-pulse" cx={x} cy={y} r={0.7} fill="var(--brand)" />
                  {on && <circle cx={x} cy={y} r={1.5} fill="none" stroke="var(--brand)" strokeWidth={0.25} />}
                  <circle cx={x} cy={y} r={on ? 0.85 : 0.65} fill="var(--brand)" stroke="#fff" strokeWidth={0.22} />
                </g>
              );
            })}

            <g data-city>
              <circle className="city-pulse" cx={HQ.x} cy={HQ.y} r={1.3} fill="var(--brand)" />
              <circle cx={HQ.x} cy={HQ.y} r={2} fill="var(--brand)" fillOpacity={0.15} />
              <circle cx={HQ.x} cy={HQ.y} r={1.15} fill="var(--ink)" stroke="#fff" strokeWidth={0.35} />
            </g>
          </svg>

          {/* HQ label */}
          <div
            aria-hidden
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-[calc(100%+0.7rem)]"
            style={{ left: pct(HQ.x, W), top: pct(HQ.y, H) }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-cream shadow-lift">
              <span className="size-1.5 rounded-full bg-brand" />
              {t("map.hq")}
            </span>
          </div>

          {/* Floating info card (sm+) */}
          <div
            aria-live="polite"
            className={cn("absolute z-10 hidden sm:block", placement.className)}
            style={placement.style}
          >
            <InfoCard index={selected} />
          </div>
        </div>
      </div>

      {/* Info card below the map (mobile) */}
      <div aria-live="polite" className="px-4 pt-4 sm:hidden">
        <InfoCard index={selected} />
      </div>

      {/* Country chips — the accessible control for the map */}
      <div className="mt-auto pt-5 pb-5 sm:pb-6">
        <ul
          aria-label={t("map.chipsLabel")}
          className="flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-6 [&::-webkit-scrollbar]:hidden"
        >
          {NETWORK.map((c, i) => {
            const on = i === selected;
            return (
              <li key={c.code} className="shrink-0">
                <button
                  ref={(el) => {
                    chips.current[i] = el;
                  }}
                  type="button"
                  aria-pressed={on}
                  onClick={() => choose(i)}
                  onKeyDown={(e) => onChipKey(e, i)}
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-300",
                    on ? "border-ink bg-ink text-cream" : "border-ink/10 bg-white/70 text-ink hover:border-ink/30",
                  )}
                >
                  <Flag code={c.code} />
                  {t(`countries.${c.code}.name`)}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
