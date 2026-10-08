"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Loader2, Phone, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { glassDark } from "@/components/ui/glass";
import { submitLead } from "@/lib/actions/submit-lead";
import { gsap, useGSAP, EASE, MOTION_QUERIES, prefersReducedMotion, scaleIn } from "@/lib/animations";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import type { SubmitResult } from "@/lib/lead-schema";
import { PHONE } from "@/lib/site";
import { INITIAL, STEPS, prefillFromSearch, validateStep, type FieldErrors, type FormState } from "./form";
import { StepContact, StepIndustry, StepPositions, StepTimeline } from "./Steps";
import { MobileSummaryBar, SummaryCard } from "./Summary";

type Status = "idle" | "submitting" | "success" | "error";

function SuccessView({ name, onReset }: { name: string; onReset: () => void }) {
  const t = useTranslations("Contact.success");
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const heading = ref.current?.querySelector<HTMLElement>("h3");
      heading?.focus();
      if (prefersReducedMotion()) return;
      gsap
        .timeline()
        .fromTo("[data-check-ring]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: EASE.inOut })
        .fromTo("[data-check-mark]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.45, ease: "power2.out" }, "-=0.15")
        .fromTo("[data-success-text]", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1, ease: EASE.out }, "-=0.2");
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className="flex min-h-[26rem] flex-col items-center justify-center py-8 text-center">
      <svg viewBox="0 0 96 96" className="size-24" aria-hidden>
        <circle cx="48" cy="48" r="44" fill="rgb(255 106 26 / 0.12)" />
        <circle data-check-ring cx="48" cy="48" r="44" fill="none" stroke="var(--brand)" strokeWidth="4" pathLength={1} strokeDasharray="1" strokeLinecap="round" transform="rotate(-90 48 48)" />
        <path data-check-mark d="M30 49 l12 12 l24 -26" fill="none" stroke="var(--brand)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" />
      </svg>
      <h3 data-success-text tabIndex={-1} className="mt-7 font-display text-[clamp(1.5rem,1.2rem+1vw,2rem)] font-semibold text-cream outline-none">
        {t("title", { name: name.split(" ")[0] })}
      </h3>
      <p data-success-text className="mt-2 text-lead text-muted-dark">
        {t("text")}
      </p>
      <div data-success-text className="mt-8">
        <Button type="button" variant="outlineLight" onClick={onReset} icon={<RotateCcw className="size-4" />}>
          {t("again")}
        </Button>
      </div>
    </div>
  );
}

/**
 * The interactive multi-step configurator (form + live summary). Loaded
 * lazily by <Contact> so zod & form code stay out of the initial bundle.
 */
export function Configurator({ directContact }: { directContact: ReactNode }) {
  const t = useTranslations("Contact");
  const ts = useTranslations("Services");
  const locale = useLocale() as "sr" | "en";
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<FormState>(INITIAL);
  const [step, setStep] = useState(0);
  const [visited, setVisited] = useState(0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorKind, setErrorKind] = useState<Extract<SubmitResult, { ok: false }>["error"] | null>(null);
  const startedAt = useRef(0);
  const direction = useRef(1);
  const stepChangedByUser = useRef(false);
  const autoAdvance = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = useCallback((patch: Partial<FormState>) => setData((d) => ({ ...d, ...patch })), []);
  const stepKey = STEPS[step];
  const errors = validateStep(stepKey, data);
  const valid = Object.keys(errors).length === 0;
  const visibleErrors: FieldErrors =
    stepKey === "contact"
      ? Object.fromEntries(Object.entries(errors).filter(([k]) => showAllErrors || touched[k]))
      : stepKey === "positions" && showAllErrors
        ? errors
        : {};

  const goTo = useCallback((next: number) => {
    direction.current = next > step ? 1 : -1;
    stepChangedByUser.current = true;
    setStep(next);
    setVisited((v) => Math.max(v, next));
    setShowAllErrors(false);
  }, [step]);

  // ---------- Prefill from URL (?industrija / ?usluga / ?zemlja) ----------
  useEffect(() => {
    startedAt.current = Date.now();
    const apply = () => {
      const pre = prefillFromSearch(window.location.search, (k) => ts(`items.${k}.title`));
      if (!pre) return;
      setData((d) => ({ ...d, ...pre.patch }));
      setStatus((s) => (s === "success" ? s : "idle"));
      if (pre.step > 0) {
        direction.current = 1;
        stepChangedByUser.current = true;
        setStep(pre.step);
        setVisited((v) => Math.max(v, pre.step));
      }
    };
    apply();
    window.addEventListener("anchor-navigate", apply);
    return () => window.removeEventListener("anchor-navigate", apply);
  }, [ts]);

  // ---------- Entrance ----------
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.motion, () => {
        root.current!.querySelectorAll("[data-contact-rise]").forEach((el, i) =>
          scaleIn(el, el, { delay: i * 0.12 }, { scale: 0.97, y: 40 }),
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // ---------- Step transition + focus management ----------
  useGSAP(
    () => {
      if (!stepChangedByUser.current) return;
      stepChangedByUser.current = false;
      panel.current?.querySelector<HTMLElement>("[data-step-heading]")?.focus({ preventScroll: true });
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        panel.current,
        { autoAlpha: 0, x: 48 * direction.current },
        { autoAlpha: 1, x: 0, duration: 0.5, ease: EASE.out },
      );
    },
    { dependencies: [step], scope: root },
  );

  useEffect(() => () => {
    if (autoAdvance.current) clearTimeout(autoAdvance.current);
  }, []);

  const onIndustryPicked = () => {
    if (autoAdvance.current) clearTimeout(autoAdvance.current);
    autoAdvance.current = setTimeout(() => goTo(1), 300);
  };

  const submit = async () => {
    setStatus("submitting");
    setErrorKind(null);
    const payload = {
      industry: data.industry,
      positions: data.positions,
      otherPosition: data.otherOn ? data.otherPosition.trim() : "",
      count: data.count,
      country: data.country,
      timeline: data.timeline,
      name: data.name.trim(),
      company: data.company.trim(),
      city: data.city.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      message: data.message.trim(),
      consent: data.consent,
      service: data.service,
      locale,
      website: data.website,
      startedAt: startedAt.current,
    };
    let res: SubmitResult;
    try {
      res = await submitLead(payload);
    } catch {
      res = { ok: false, error: "send" };
    }
    if (res.ok) {
      setStatus("success");
      // Bots that filled the honeypot get a fake success — don't count them.
      if (!data.website) track("lead_submitted", {
        industry: data.industry,
        workers: data.count,
        country: data.country,
        timeline: data.timeline,
        locale,
      });
    } else {
      setStatus("error");
      setErrorKind(res.error);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault(); // Enter anywhere = "Next" / "Send"
    if (status === "submitting") return;
    if (!valid) {
      setShowAllErrors(true);
      return;
    }
    if (step < STEPS.length - 1) goTo(step + 1);
    else void submit();
  };

  const reset = () => {
    setData(INITIAL);
    setTouched({});
    setStatus("idle");
    setVisited(0);
    startedAt.current = Date.now();
    goTo(0);
  };

  const sent = status === "success";

  return (
    <div ref={root} className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
      {/* ---------------- Form ---------------- */}
      <div className="lg:col-span-7">
        <div data-contact-rise data-reveal className={cn(glassDark, "rounded-panel p-5 sm:p-8 lg:p-10")}>
          {!sent && (
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium text-muted-dark" aria-live="polite">
                  {t("stepOf", { current: step + 1, total: STEPS.length })}
                </p>
                <p className="font-semibold text-cream">{t(`steps.${stepKey}.title`)}</p>
              </div>
              <div aria-hidden className="mt-3 grid grid-cols-4 gap-1.5">
                {STEPS.map((s, i) => (
                  <span key={s} className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <span
                      className={cn(
                        "block h-full origin-left rounded-full bg-brand transition-transform duration-500 ease-(--ease-out-expo) motion-reduce:transition-none",
                        i <= step ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </span>
                ))}
              </div>
            </div>
          )}

          {sent ? (
            <SuccessView name={data.name} onReset={reset} />
          ) : (
            <form noValidate onSubmit={onSubmit} aria-labelledby="kontakt-title">
              <div ref={panel} className="relative">
                {stepKey === "industry" && <StepIndustry data={data} set={set} errors={visibleErrors} onPicked={onIndustryPicked} />}
                {stepKey === "positions" && <StepPositions data={data} set={set} errors={visibleErrors} />}
                {stepKey === "timeline" && <StepTimeline data={data} set={set} errors={visibleErrors} />}
                {stepKey === "contact" && (
                  <StepContact
                    data={data}
                    set={set}
                    errors={visibleErrors}
                    onBlurField={(name) => setTouched((tt) => ({ ...tt, [name]: true }))}
                  />
                )}
              </div>

              {status === "error" && (
                <div role="alert" className="mt-6 rounded-2xl border border-[#FF8A73]/40 bg-[#FF8A73]/10 p-4 text-sm">
                  <p className="font-semibold text-cream">{t("failure.title")}</p>
                  <p className="mt-1 text-cream/80">{errorKind === "rate" ? t("failure.rate") : t("failure.text")}</p>
                  <a href={PHONE.href} className="mt-3 inline-flex items-center gap-2 font-semibold text-brand hover:underline">
                    <Phone className="size-4" /> {PHONE.display}
                  </a>
                </div>
              )}

              <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/10 pt-6">
                {step > 0 ? (
                  <Button type="button" variant="outlineLight" onClick={() => goTo(step - 1)} icon={<ArrowLeft className="size-4" />} className="[&>span:last-child]:order-first">
                    {t("back")}
                  </Button>
                ) : (
                  <span />
                )}
                <Button
                  type="submit"
                  disabled={!valid || status === "submitting"}
                  size={step === STEPS.length - 1 ? "lg" : "md"}
                  icon={
                    status === "submitting" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ArrowRight className="size-[1.125rem]" />
                    )
                  }
                >
                  {step < STEPS.length - 1
                    ? t("next")
                    : status === "submitting"
                      ? t("sending")
                      : status === "error"
                        ? t("failure.retry")
                        : t("submit")}
                </Button>
              </div>
            </form>
          )}
        </div>

        <MobileSummaryBar data={data} visited={visited} sent={sent} />
      </div>

      {/* ---------------- Live summary + direct contact ---------------- */}
      <aside className="lg:col-span-5">
        <div className="space-y-5 lg:sticky lg:top-28">
          <div data-contact-rise data-reveal className="hidden lg:block">
            <SummaryCard data={data} visited={visited} sent={sent} />
          </div>
          <div data-contact-rise data-reveal>
            {directContact}
          </div>
        </div>
      </aside>
    </div>
  );
}
