import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { BadgeCheck, Check, Loader2, Plane, ShieldCheck } from "lucide-react";
import { Flag } from "@/components/ui/Flag";
import { glass } from "@/components/ui/glass";
import { cn } from "@/lib/cn";

// TODO: temporary Unsplash photos — replace with real client photos.
const PHOTO_MAIN =
  "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1400&q=80";
const PHOTO_AVATAR =
  "https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&crop=faces&w=160&h=160&q=80";


/**
 * Wrapper layers for a floating card. Each layer owns exactly one motion so
 * tweens never fight over the same transform:
 *   position + scroll parallax → mouse parallax → idle float → pop-in
 */
function Floating({
  children,
  className,
  depth,
  float,
  scroll,
  order,
}: {
  children: ReactNode;
  /** Pop-in order (stagger). */
  order: number;
  className?: string;
  /** Mouse parallax strength (0–1). */
  depth: number;
  /** Idle float period in seconds. */
  float: number;
  /** Scroll drift in px over the hero's scroll range. */
  scroll: number;
}) {
  return (
    <div data-fc-scroll={scroll} className={cn("absolute z-10", className)}>
      <div data-fc-mouse={depth}>
        <div data-fc-idle={float}>
          <div className="hero-pop" style={{ "--d": `${1.1 + order * 0.15}s` } as React.CSSProperties}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function CandidateCard() {
  const t = useTranslations("Hero.stage.candidate");
  return (
    <div className={cn(glass, "flex w-[15.75rem] items-center gap-3 p-3 sm:w-[16.5rem] sm:p-3.5")}>
      <div className="relative size-11 shrink-0 overflow-hidden rounded-full ring-2 ring-white sm:size-12">
        <Image src={PHOTO_AVATAR} alt="" fill sizes="48px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold whitespace-nowrap text-ink">{t("name")}</p>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-emerald-800">
            <BadgeCheck aria-hidden className="size-3.5" />
            {t("verified")}
          </span>
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink/80">
          {t("role")} · {t("country")}
          <Flag code="nepal" />
        </p>
        <p className="mt-0.5 text-xs text-muted">{t("experience")}</p>
      </div>
    </div>
  );
}

function VisaCard() {
  const t = useTranslations("Hero.stage.visa");
  const done = (label: string) => (
    <li className="flex flex-col items-center gap-1.5">
      <span className="relative z-10 grid size-6 place-items-center rounded-full bg-emerald-600 text-white ring-4 ring-cream-soft">
        <Check aria-hidden className="size-3.5" />
      </span>
      <span className="text-[0.6875rem] font-medium text-ink/80">{label}</span>
    </li>
  );

  return (
    <div className={cn(glass, "w-[14.5rem] p-4 sm:w-[16.5rem]")}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink">{t("title")}</p>
        {/* Status: SSR shows the final ("approved") state; motion users see it loop. */}
        <span className="relative inline-grid text-[0.6875rem] font-semibold">
          <span
            data-visa-pending
            className="col-start-1 row-start-1 inline-flex items-center gap-1 justify-self-end rounded-full bg-peach/40 px-2 py-0.5 text-brand-deep opacity-0"
          >
            <Loader2 aria-hidden className="size-3 animate-spin motion-reduce:animate-none" />
            {t("pending")}
          </span>
          <span
            data-visa-approved
            className="col-start-1 row-start-1 inline-flex items-center gap-1 justify-self-end rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-800"
          >
            {t("approved")}
            <Check aria-hidden className="size-3" />
          </span>
        </span>
      </div>

      <ol className="relative mt-4 grid grid-cols-3">
        {/* connector track */}
        <span aria-hidden className="absolute top-3 right-[16.66%] left-[16.66%] h-0.5 rounded-full bg-ink/10" />
        <span aria-hidden className="absolute top-3 left-[16.66%] h-0.5 w-[33.33%] rounded-full bg-emerald-600" />
        <span
          aria-hidden
          data-visa-line
          className="absolute top-3 left-1/2 h-0.5 w-[33.33%] origin-left rounded-full bg-emerald-600"
        />
        {done(t("steps.documents"))}
        {done(t("steps.visa"))}
        <li className="flex flex-col items-center gap-1.5">
          <span className="relative z-10 grid size-6 place-items-center rounded-full ring-4 ring-cream-soft">
            <span
              data-visa-dot-pending
              className="absolute inset-0 grid place-items-center rounded-full border-2 border-dashed border-brand bg-cream-soft opacity-0"
            />
            <span
              data-visa-dot-approved
              className="absolute inset-0 grid place-items-center rounded-full bg-emerald-600 text-white"
            >
              <Check aria-hidden className="size-3.5" />
            </span>
          </span>
          <span className="text-[0.6875rem] font-medium text-ink/80">{t("steps.permit")}</span>
        </li>
      </ol>
    </div>
  );
}

function ArrivalCard() {
  const t = useTranslations("Hero.stage.arrival");
  return (
    <div className={cn(glass, "w-[14rem] p-3.5 sm:w-[15rem]")}>
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-peach text-brand-deep">
          <Plane aria-hidden className="size-[1.125rem]" />
        </span>
        <div>
          <p className="text-xs text-muted">{t("title")}</p>
          <p className="text-sm font-semibold text-ink">{t("eta")}</p>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10">
        <div data-arrival-bar className="hero-bar h-full w-[68%] origin-left rounded-full bg-brand" />
      </div>
    </div>
  );
}

function GuaranteePill() {
  const t = useTranslations("Hero.stage");
  return (
    <div className={cn(glass, "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-ink sm:text-sm")}>
      <ShieldCheck aria-hidden className="size-4 text-brand-deep" />
      {t("guarantee")}
    </div>
  );
}

export function HeroStage() {
  const t = useTranslations("Hero.stage");

  return (
    <div data-stage className="relative mx-auto w-full max-w-[34rem] lg:mr-0 lg:max-w-[33rem] xl:max-w-[36rem]">
      {/* Depth: blob + dotted pattern behind the photo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[12%] left-[18%] h-[78%] w-[78%] animate-[spin_48s_linear_infinite] rounded-[42%_58%_55%_45%/48%_42%_58%_52%] bg-gradient-to-br from-brand/45 via-peach to-peach/40 blur-3xl motion-reduce:animate-none" />
        <div className="absolute -top-4 -right-2 h-1/2 w-2/3 bg-[radial-gradient(var(--ink)_1.1px,transparent_1.6px)] [mask-image:radial-gradient(closest-side,#000,transparent)] bg-[length:14px_14px] opacity-25" />
        <div className="absolute -bottom-6 -left-2 h-2/5 w-1/2 bg-[radial-gradient(var(--brand)_1.1px,transparent_1.6px)] [mask-image:radial-gradient(closest-side,#000,transparent)] bg-[length:14px_14px] opacity-40" />
      </div>

      {/* Photo card */}
      <div className="py-10 pr-4 pl-8 sm:py-12 sm:pr-10 sm:pl-16 lg:pr-6 lg:pl-14 xl:pl-16">
        <div data-photo-scroll>
          <div
            data-photo
            className="hero-photo relative aspect-[4/4.6] overflow-hidden rounded-panel bg-peach shadow-lift sm:aspect-[4/5]"
          >
            <Image
              src={PHOTO_MAIN}
              alt={t("photoAlt")}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1280px) 31rem, (min-width: 1024px) 28rem, (min-width: 640px) 26rem, calc(100vw - 4.5rem)"
              className="scale-[1.12] object-cover object-[50%_85%]"
            />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-brand/45 via-brand/10 to-transparent mix-blend-multiply" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/25 to-transparent" />
            <div aria-hidden className="absolute inset-0 rounded-panel ring-1 ring-inset ring-white/20" />
          </div>
        </div>
      </div>

      {/* Floating UI — mobile shows 2 cards (candidate + visa), sm+ shows all 4 */}
      <Floating order={0} depth={0.9} float={4.6} scroll={-70} className="top-[4%] left-0 sm:top-[9%]">
        <CandidateCard />
      </Floating>
      <Floating order={1} depth={0.5} float={5.4} scroll={-40} className="top-[2%] right-[6%] hidden sm:block lg:right-[2%]">
        <GuaranteePill />
      </Floating>
      <Floating order={2} depth={0.7} float={5} scroll={30} className="right-0 bottom-[6%] sm:top-[44%] sm:bottom-auto lg:-right-[2%]">
        <VisaCard />
      </Floating>
      <Floating order={3} depth={1} float={4.2} scroll={80} className="bottom-[4%] left-[2%] hidden sm:block">
        <ArrivalCard />
      </Floating>
    </div>
  );
}
