import type { Country, Industry, Timeline } from "@/lib/lead-schema";
import { stepSchemas } from "@/lib/lead-schema";
import { INDUSTRIES as INDUSTRY_DATA } from "@/components/sections/industries/data";
import { SERVICES } from "@/components/sections/services/data";

export type FormState = {
  industry?: Industry;
  positions: string[];
  otherOn: boolean;
  otherPosition: string;
  count: number;
  country: Country;
  timeline?: Timeline;
  name: string;
  company: string;
  city: string;
  phone: string;
  email: string;
  message: string;
  consent: boolean;
  website: string; // honeypot
  service?: string; // from ?usluga=
};

export const INITIAL: FormState = {
  positions: [],
  otherOn: false,
  otherPosition: "",
  count: 1,
  country: "none",
  name: "",
  company: "",
  city: "",
  phone: "",
  email: "",
  message: "",
  consent: false,
  website: "",
};

export const STEPS = ["industry", "positions", "timeline", "contact"] as const;
export type StepKey = (typeof STEPS)[number];

export type FieldErrors = Partial<Record<string, string>>;

/** Validate one step; returns translation keys per field. */
export function validateStep(step: StepKey, d: FormState): FieldErrors {
  const input =
    step === "industry"
      ? { industry: d.industry }
      : step === "positions"
        ? {
            positions: d.positions,
            otherPosition: d.otherOn ? d.otherPosition : "",
            count: d.count,
            country: d.country,
          }
        : step === "timeline"
          ? { timeline: d.timeline }
          : {
              name: d.name,
              company: d.company,
              city: d.city,
              phone: d.phone,
              email: d.email,
              message: d.message,
              consent: d.consent,
            };
  const res = stepSchemas[step].safeParse(input);
  if (res.success) return {};
  const errors: FieldErrors = {};
  for (const issue of res.error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}

/** Map URL params from earlier CTAs to form state + the step to open. */
export function prefillFromSearch(search: string, serviceTitle: (key: string) => string) {
  const params = new URLSearchParams(search);
  const patch: Partial<FormState> = {};
  let step = 0;

  const industry = INDUSTRY_DATA.find((i) => i.slug === params.get("industrija"));
  if (industry) {
    patch.industry = industry.key;
    step = 1;
  }

  const service = SERVICES.find((s) => s.slug === params.get("usluga"));
  if (service) {
    const title = serviceTitle(service.key);
    patch.industry ??= "other";
    patch.service = title;
    patch.otherOn = true;
    patch.otherPosition = title;
    step = 1;
  }

  const country = params.get("zemlja");
  if (country && ["nepal", "indonesia", "uzbekistan", "kenya", "uae", "india"].includes(country)) {
    patch.country = country as Country;
  }

  return Object.keys(patch).length ? { patch, step } : null;
}
