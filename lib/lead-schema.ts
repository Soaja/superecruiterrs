import { z } from "zod";

/**
 * Contact-configurator payload. Shared by the client (per-step validation)
 * and the server action (authoritative validation). Error messages are
 * translation keys under Contact.errors.
 */
export const INDUSTRIES = ["hospitality", "logistics", "construction", "other"] as const;
export const COUNTRIES = ["none", "nepal", "indonesia", "uzbekistan", "kenya", "uae", "india"] as const;
export const TIMELINES = ["asap", "1-2", "3-6", "season"] as const;

export type Industry = (typeof INDUSTRIES)[number];
export type Country = (typeof COUNTRIES)[number];
export type Timeline = (typeof TIMELINES)[number];

// Loose international phone check: digits, spaces, +, -, /, () — 6+ digits.
const phoneRe = /^\+?[\d\s\-/()]{6,20}$/;

export const stepSchemas = {
  industry: z.object({ industry: z.enum(INDUSTRIES, { error: "required" }) }),
  positions: z
    .object({
      positions: z.array(z.string().max(80)).max(20),
      otherPosition: z.string().trim().max(120),
      count: z.number({ error: "count" }).int("count").min(1, "count").max(100, "count"),
      country: z.enum(COUNTRIES),
    })
    .refine((d) => d.positions.length > 0 || d.otherPosition.length > 0, {
      message: "positions",
      path: ["positions"],
    }),
  timeline: z.object({ timeline: z.enum(TIMELINES, { error: "required" }) }),
  contact: z.object({
    name: z.string().trim().min(2, "required").max(100),
    company: z.string().trim().min(2, "required").max(120),
    city: z.string().trim().max(80),
    phone: z.string().trim().regex(phoneRe, "phone"),
    email: z.email("email").max(160),
    message: z.string().trim().max(2000),
    consent: z.literal(true, { error: "consent" }),
  }),
};

export const leadSchema = stepSchemas.industry
  .and(stepSchemas.positions)
  .and(stepSchemas.timeline)
  .and(stepSchemas.contact)
  .and(
    z.object({
      service: z.string().max(60).optional(),
      locale: z.enum(["sr", "en"]),
      // Spam protection
      website: z.string().max(0), // honeypot — must stay empty
      startedAt: z.number(),
    }),
  );

export type Lead = z.infer<typeof leadSchema>;

export type SubmitResult =
  | { ok: true }
  | { ok: false; error: "invalid" | "rate" | "spam" | "config" | "send" };
