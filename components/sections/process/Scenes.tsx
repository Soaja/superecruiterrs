"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  BadgeCheck,
  Check,
  FileText,
  Loader2,
  Mic,
  PhoneOff,
  Send,
  ShieldCheck,
  Video,
} from "lucide-react";
import { Flag, type FlagCode } from "@/components/ui/Flag";
import { gsap, EASE, isMotionPathReady } from "@/lib/animations";
import { cn } from "@/lib/cn";

/**
 * Six mini UI mocks for the "Kako radimo" stage. Each scene's markup is its
 * FINAL state (what reduced-motion / no-JS users see); `buildSceneTimeline`
 * replays the micro-animation from the start every time a scene activates.
 * Mocks are decorative — the step text is the accessible content.
 */
export const SCENE_KEYS = ["request", "selection", "interview", "permits", "arrival", "support"] as const;
export type SceneKey = (typeof SCENE_KEYS)[number];

// TODO: temporary Unsplash photo — replace with real candidate photos.
const CANDIDATE_PHOTO =
  "https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&crop=faces&w=800&h=900&q=80";

const card = "rounded-2xl border border-white/60 bg-cream-soft text-ink shadow-float";
const AVATAR_TONES = ["bg-peach text-ink", "bg-brand text-ink", "bg-[#F3E6DA] text-ink", "bg-ink text-cream"];

// Lucide "plane" glyph (24×24), used inside the boarding-pass SVG.
const PLANE_D =
  "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z";
const ARC_D = "M14 52 Q110 -8 206 52";

/* ------------------------------------------------------------------ */

function RequestScene() {
  const t = useTranslations("Process.scenes.request");
  const fields = ["industry", "position", "count", "start"] as const;
  return (
    <div className={cn(card, "w-full max-w-[22rem] p-5 sm:p-6")}>
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-semibold">{t("title")}</p>
        <span className="size-2 rounded-full bg-brand" />
      </div>
      <div className="mt-4 space-y-3">
        {fields.map((f) => (
          <div key={f} data-field className="relative">
            <p className="text-[0.6875rem] font-medium tracking-wide text-muted uppercase">{t(`fields.${f}.label`)}</p>
            <div className="relative mt-1 flex h-10 items-center rounded-xl border border-ink/10 bg-white px-3 text-sm font-medium">
              <span data-type className="inline-block whitespace-nowrap">
                {t(`fields.${f}.value`)}
              </span>
              <span
                data-focus
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-brand opacity-0"
              />
            </div>
          </div>
        ))}
      </div>
      <div data-submit className="relative mt-5 grid h-11 place-items-center overflow-hidden rounded-full text-sm font-semibold">
        <span data-submit-idle className="absolute inset-0 grid place-items-center bg-brand text-ink opacity-0">
          <span className="inline-flex items-center gap-2">
            {t("submit")} <Send className="size-4" />
          </span>
        </span>
        <span data-submit-done className="absolute inset-0 grid place-items-center bg-emerald-600 text-white">
          <span className="inline-flex items-center gap-1.5">
            {t("sent")} <Check className="size-4" />
          </span>
        </span>
      </div>
    </div>
  );
}

type Candidate = { name: string; role: string; country: FlagCode; years: number; initials: string };

function SelectionScene() {
  const t = useTranslations("Process.scenes.selection");
  const candidates = t.raw("candidates") as Candidate[];
  return (
    <div className="w-full max-w-[24rem]">
      <div className="mb-3 flex items-baseline justify-between px-1">
        <p className="font-display text-lg font-semibold text-cream">{t("title")}</p>
        <p className="text-xs text-muted-dark">{t("subtitle")}</p>
      </div>
      <ul className="space-y-2.5">
        {candidates.map((c, i) => (
          <li key={c.name} data-cand className={cn(card, "flex items-center gap-3 p-3")}>
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full text-xs font-bold",
                AVATAR_TONES[i % AVATAR_TONES.length],
              )}
            >
              {c.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap">
                {c.name} <Flag code={c.country} />
              </p>
              <p className="truncate text-xs text-muted">
                {c.role} · {t("years", { n: c.years })}
              </p>
            </div>
            <span
              data-stamp
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 p-1.5 text-[0.6875rem] font-semibold text-emerald-800 ring-1 ring-emerald-600/20 sm:px-2 sm:py-1"
            >
              <BadgeCheck className="size-4 sm:size-3.5" />
              {/* Icon-only on phones so names get the room */}
              <span className="hidden sm:inline">{t("verified")}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InterviewScene() {
  const t = useTranslations("Process.scenes.interview");
  return (
    <div className="relative w-full max-w-[24rem]">
      <div data-tile className="relative aspect-[4/4.4] overflow-hidden rounded-2xl bg-[#2a221d] shadow-float">
        <Image src={CANDIDATE_PHOTO} alt="" fill sizes="(min-width: 1024px) 24rem, 80vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-ink/55 px-2.5 py-1 text-[0.6875rem] font-semibold text-cream backdrop-blur">
          <span className="size-1.5 rounded-full bg-red-500" /> {t("live")} · {t("duration")}
        </div>
        <div className="absolute bottom-16 left-3 text-cream">
          <p className="text-sm font-semibold">{t("name")}</p>
          <p className="text-xs text-cream/75">{t("location")}</p>
        </div>
        {/* self view */}
        <div
          data-self
          className="absolute top-3 right-3 grid h-20 w-16 place-items-center rounded-xl border border-white/20 bg-[#3a2f28] text-xs font-bold text-cream shadow-lg"
        >
          {t("you")}
        </div>
        {/* controls */}
        <div data-controls className="absolute inset-x-0 bottom-3 flex justify-center gap-2.5">
          {[Mic, Video].map((Icon, i) => (
            <span key={i} className="grid size-9 place-items-center rounded-full bg-white/15 text-cream backdrop-blur">
              <Icon className="size-4" />
            </span>
          ))}
          <span className="grid size-9 place-items-center rounded-full bg-red-500 text-white">
            <PhoneOff className="size-4" />
          </span>
        </div>
      </div>
      <div data-selected className="absolute -right-3 -bottom-4 sm:-right-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-bold text-ink shadow-brand">
          {t("selected")} <Check className="size-4" />
        </span>
      </div>
    </div>
  );
}

function PermitsScene() {
  const t = useTranslations("Process.scenes.permits");
  const items = ["passport", "contract", "visa", "permit"] as const;
  return (
    <div className="relative w-full max-w-[22rem]">
      <div className={cn(card, "p-5 sm:p-6")}>
        <p className="font-display text-lg font-semibold">{t("title")}</p>
        <ul className="mt-4 divide-y divide-ink/[0.07]">
          {items.map((k, i) => {
            const last = i === items.length - 1;
            return (
              <li key={k} data-doc className="flex items-center gap-3 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-peach/70 text-brand-deep">
                  <FileText className="size-4" />
                </span>
                <span className="flex-1 text-sm font-medium">{t(`items.${k}`)}</span>
                {last ? (
                  <span className="relative grid h-6 min-w-6 place-items-center">
                    <span
                      data-doc-pending
                      className="absolute right-0 inline-flex items-center gap-1 whitespace-nowrap text-[0.6875rem] font-semibold text-brand-deep opacity-0"
                    >
                      <Loader2 className="size-3.5 animate-spin" /> {t("pending")}
                    </span>
                    <span data-doc-done className="grid size-6 place-items-center rounded-full bg-emerald-600 text-white">
                      <Check className="size-3.5" />
                    </span>
                  </span>
                ) : (
                  <span className="grid size-6 place-items-center rounded-full bg-emerald-600 text-white">
                    <Check className="size-3.5" />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {/* Stamp: outer wrapper holds the resting tilt, inner element is animated */}
      <div className="absolute -right-3 -bottom-10 origin-bottom-right -rotate-12 scale-75 sm:-right-10 sm:-bottom-12 sm:scale-100">
        <div
          data-stamp-mark
          className="grid size-32 place-items-center rounded-full border-[3px] border-brand bg-ink/40 text-center backdrop-blur-[2px]"
        >
          <div className="grid size-[6.75rem] place-items-center rounded-full border border-dashed border-brand">
            <span className="font-display text-[0.8125rem] font-extrabold tracking-[0.06em] text-brand">{t("stamp")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrivalScene() {
  const t = useTranslations("Process.scenes.arrival");
  const meta = [
    ["passenger", "passengerName"],
    ["date", "dateValue"],
    ["gate", "gateValue"],
    ["flight", "flightValue"],
  ] as const;
  return (
    <div className={cn(card, "w-full max-w-[23rem] overflow-hidden")}>
      <div className="flex items-center justify-between bg-brand px-5 py-2.5 text-ink">
        <span className="text-xs font-bold tracking-[0.14em] uppercase">{t("label")}</span>
        <span className="text-xs font-semibold">{t("flightValue")}</span>
      </div>
      <div className="px-5 pt-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-display text-4xl leading-none font-bold tracking-tight">{t("from.code")}</p>
            <p className="mt-1 text-xs text-muted">{t("from.city")}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-4xl leading-none font-bold tracking-tight">{t("to.code")}</p>
            <p className="mt-1 text-xs text-muted">{t("to.city")}</p>
          </div>
        </div>
        <svg viewBox="0 0 220 60" className="-mt-2 h-auto w-full overflow-visible" aria-hidden>
          <path d={ARC_D} fill="none" stroke="var(--ink)" strokeOpacity={0.25} strokeWidth={1.5} strokeDasharray="2 5" strokeLinecap="round" />
          <path data-trail d={ARC_D} pathLength={1} fill="none" stroke="var(--brand)" strokeWidth={2} strokeLinecap="round" strokeDasharray="1" />
          <circle cx="14" cy="52" r="3.5" fill="var(--ink)" />
          <circle cx="206" cy="52" r="3.5" fill="var(--brand)" />
          {/* Resting position: at the destination */}
          <g data-plane transform="translate(206 52) rotate(77)">
            <path d={PLANE_D} transform="translate(-12 -12) scale(0.9)" fill="var(--ink)" stroke="var(--cream-soft)" strokeWidth={1} />
          </g>
        </svg>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-y-3 border-t border-dashed border-ink/15 px-5 py-4">
        {meta.map(([label, value]) => (
          <div key={label}>
            <p className="text-[0.6875rem] font-medium tracking-wide text-muted uppercase">{t(label)}</p>
            <p className="text-sm font-semibold">{t(value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SupportScene() {
  const t = useTranslations("Process.scenes.support");
  return (
    <div className="flex w-full max-w-[23rem] flex-col items-center gap-6">
      <div className="relative grid size-44 place-items-center sm:size-48">
        <svg viewBox="0 0 120 120" className="absolute inset-0 size-full -rotate-90" aria-hidden>
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgb(255 255 255 / 0.1)" strokeWidth="6" />
          <circle
            data-ring
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="var(--brand)"
            strokeWidth="6"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
          />
        </svg>
        <div data-shield className="flex flex-col items-center text-center">
          <ShieldCheck className="size-10 text-brand" />
          <p className="mt-1 font-display text-4xl leading-none font-bold text-cream">{t("days")}</p>
          <p className="text-sm font-medium text-muted-dark">{t("daysLabel")}</p>
        </div>
      </div>
      <p className="-mt-2 text-xs font-semibold tracking-[0.14em] text-muted-dark uppercase">{t("guarantee")}</p>
      <div className="w-full space-y-2.5">
        <div data-bubble className="flex items-end gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-[0.625rem] font-bold text-ink">SR</span>
          <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-cream-soft px-3.5 py-2.5 text-sm text-ink shadow-lg">
            <p className="text-[0.625rem] font-semibold text-muted">{t("us")}</p>
            {t("question")}
          </div>
        </div>
        <div data-bubble className="flex items-end justify-end gap-2">
          <div className="max-w-[80%] rounded-2xl rounded-br-md bg-brand px-3.5 py-2.5 text-sm text-ink shadow-lg">
            <p className="text-[0.625rem] font-semibold text-ink/70">{t("them")}</p>
            {t("answer")}
          </div>
        </div>
      </div>
    </div>
  );
}

const COMPONENTS: Record<SceneKey, () => React.JSX.Element> = {
  request: RequestScene,
  selection: SelectionScene,
  interview: InterviewScene,
  permits: PermitsScene,
  arrival: ArrivalScene,
  support: SupportScene,
};

export function Scene({ name }: { name: SceneKey }) {
  const Component = COMPONENTS[name];
  return <Component />;
}

/* ------------------------------------------------------------------ */
/* Micro-animations — each starts from its "before" state via fromTo.  */
/* ------------------------------------------------------------------ */

export function buildSceneTimeline(name: SceneKey, el: HTMLElement): gsap.core.Timeline {
  const q = gsap.utils.selector(el);
  const tl = gsap.timeline({ defaults: { ease: EASE.out } });

  switch (name) {
    case "request": {
      // Start states applied immediately (not as timeline sets) so a paused,
      // primed timeline already shows the "before" state.
      gsap.set(q("[data-submit-idle]"), { autoAlpha: 1 });
      gsap.set(q("[data-submit-done]"), { autoAlpha: 0 });
      gsap.set(q("[data-type]"), { clipPath: "inset(0 100% 0 0)" });
      q("[data-field]").forEach((field, i) => {
        const text = field.querySelector<HTMLElement>("[data-type]")!;
        const focus = field.querySelector("[data-focus]");
        const len = Math.max(text.textContent?.length ?? 1, 1);
        const at = 0.2 + i * 0.55;
        tl.to(focus, { autoAlpha: 1, duration: 0.15 }, at)
          .to(text, { clipPath: "inset(0 0% 0 0)", duration: Math.min(0.05 * len, 0.45), ease: `steps(${len})` }, at + 0.05)
          .to(focus, { autoAlpha: 0, duration: 0.2 }, at + 0.5);
      });
      tl.to(q("[data-submit]"), { scale: 0.94, duration: 0.12, ease: "power2.in" }, "+=0.2")
        .to(q("[data-submit]"), { scale: 1, duration: 0.3, ease: "back.out(3)" })
        .to(q("[data-submit-idle]"), { autoAlpha: 0, duration: 0.25 }, "<")
        .to(q("[data-submit-done]"), { autoAlpha: 1, duration: 0.3 }, "<");
      break;
    }
    case "selection": {
      q("[data-cand]").forEach((row, i) => {
        const at = i * 0.32;
        tl.fromTo(row, { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.55 }, at).fromTo(
          row.querySelector("[data-stamp]"),
          { autoAlpha: 0, scale: 1.8, rotation: -14 },
          { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.45, ease: "back.out(3)" },
          at + 0.45,
        );
      });
      break;
    }
    case "interview": {
      tl.fromTo(q("[data-tile]"), { autoAlpha: 0, scale: 0.95 }, { autoAlpha: 1, scale: 1, duration: 0.6 })
        .fromTo(q("[data-self]"), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, 0.35)
        .fromTo(q("[data-controls]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.45 }, 0.5)
        .fromTo(
          q("[data-selected]"),
          { autoAlpha: 0, scale: 0.4, rotation: -10 },
          { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2.6)" },
          1.6,
        );
      break;
    }
    case "permits": {
      gsap.set(q("[data-doc-pending]"), { autoAlpha: 1 });
      gsap.set(q("[data-doc-done]"), { autoAlpha: 0, scale: 0.5 });
      tl.fromTo(q("[data-doc]"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.14 }, 0)
        .to(q("[data-doc-pending]"), { autoAlpha: 0, duration: 0.2 }, 1.5)
        .to(q("[data-doc-done]"), { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(3)" }, 1.55)
        .fromTo(
          q("[data-stamp-mark]"),
          { autoAlpha: 0, scale: 2.2, rotation: -24 },
          { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.55, ease: "back.out(2.2)" },
          1.95,
        );
      break;
    }
    case "arrival": {
      const path = el.querySelector<SVGPathElement>("[data-trail]")!;
      tl.fromTo(q("[data-trail]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.2, ease: "power1.inOut" }, 0.2);
      // Plane flight needs MotionPathPlugin (loaded on demand by <Process>);
      // if it isn't ready yet the plane simply rests at the destination.
      if (!isMotionPathReady()) break;
      tl.fromTo(
        q("[data-plane]"),
        { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: 45, start: 0, end: 0 } },
        {
          motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: 45, start: 0, end: 1 },
          duration: 2.2,
          ease: "power1.inOut",
        },
        0.2,
      );
      break;
    }
    case "support": {
      tl.fromTo(q("[data-ring]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: EASE.inOut }, 0)
        .fromTo(q("[data-shield]"), { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(2)" }, 0.1)
        .fromTo(q("[data-bubble]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.7 }, 1.1);
      break;
    }
  }
  return tl;
}
