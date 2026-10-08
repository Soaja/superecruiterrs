"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import sr from "@/messages/sr.json";
import en from "@/messages/en.json";
import { leadSchema, type Lead, type SubmitResult } from "@/lib/lead-schema";

const MIN_FILL_MS = 4000; // faster than this is almost certainly a bot
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

// In-memory, per-instance rate limit. Fine for one server; swap for
// Redis/Upstash when deploying to multiple instances.
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_MAX;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const fill = (tpl: string, vars: Record<string, string>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

/** Agency notification — always in Serbian. */
function agencyEmail(lead: Lead) {
  const c = sr.Contact;
  const industry = c.industries[lead.industry];
  const positions = [...lead.positions, lead.otherPosition].filter(Boolean).join(", ");
  const rows: [string, string][] = [
    [c.summary.industry, industry],
    [c.summary.positions, positions],
    [c.summary.count, String(lead.count)],
    [c.summary.country, c.countries[lead.country]],
    [c.summary.timeline, c.timelines[lead.timeline]],
    [c.fields.name, lead.name],
    [c.fields.company, lead.company],
    [c.fields.city, lead.city || "—"],
    [c.fields.phone, lead.phone],
    [c.fields.email, lead.email],
    ...(lead.service ? ([[c.email.service, lead.service]] as [string, string][]) : []),
    [c.email.locale, lead.locale.toUpperCase()],
  ];

  const html = `<!doctype html><html><body style="margin:0;background:#FFF6EE;font-family:Arial,Helvetica,sans-serif;color:#1E1814">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px"><tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFBF7;border-radius:16px;border:1px solid #F0DCCB">
    <tr><td style="padding:24px 28px;border-bottom:4px solid #FF6A1A">
      <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#6B5E55">SUPERECRUITER</div>
      <div style="font-size:22px;font-weight:bold;margin-top:6px">${esc(c.email.heading)}</div>
    </td></tr>
    <tr><td style="padding:12px 28px 4px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${rows
          .map(
            ([k, v]) => `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #F0E4D8;font-size:13px;color:#6B5E55;width:40%;vertical-align:top">${esc(k)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #F0E4D8;font-size:14px;font-weight:bold">${esc(v)}</td></tr>`,
          )
          .join("")}
      </table>
    </td></tr>
    ${
      lead.message
        ? `<tr><td style="padding:16px 28px 24px"><div style="font-size:13px;color:#6B5E55;margin-bottom:6px">${esc(c.email.message)}</div>
      <div style="font-size:14px;line-height:1.6;white-space:pre-wrap;background:#FFF6EE;border-radius:10px;padding:14px">${esc(lead.message)}</div></td></tr>`
        : ""
    }
  </table></td></tr></table></body></html>`;

  return {
    subject: fill(c.email.subject, { company: lead.company, industry }),
    html,
  };
}

/** Optional confirmation to the client, in the site language. */
function autoReply(lead: Lead) {
  const e = (lead.locale === "en" ? en : sr).Contact.email;
  const html = `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#1E1814;line-height:1.6">
    <p>${esc(fill(e.replyGreeting, { name: lead.name }))}</p>
    <p>${esc(e.replyBody)}</p>
    <p>— ${esc(e.replySignature)}</p></body></html>`;
  return { subject: e.replySubject, html };
}

export async function submitLead(input: unknown): Promise<SubmitResult> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    // A filled honeypot fails validation too — answer like a success so
    // bots get no signal, but never send anything.
    const honeypot = (input as { website?: unknown })?.website;
    if (typeof honeypot === "string" && honeypot.length > 0) return { ok: true };
    return { ok: false, error: "invalid" };
  }
  const lead = parsed.data;

  if (Date.now() - lead.startedAt < MIN_FILL_MS) return { ok: false, error: "spam" };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) return { ok: false, error: "rate" };

  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL, CONTACT_AUTOREPLY } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
    console.error("[submitLead] Missing RESEND_API_KEY / CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL");
    return { ok: false, error: "config" };
  }

  const resend = new Resend(RESEND_API_KEY);
  try {
    const mail = agencyEmail(lead);
    const { error } = await resend.emails.send({
      from: CONTACT_FROM_EMAIL,
      to: CONTACT_TO_EMAIL,
      replyTo: lead.email,
      subject: mail.subject,
      html: mail.html,
    });
    if (error) {
      console.error("[submitLead] Resend error:", error.message);
      return { ok: false, error: "send" };
    }

    if (CONTACT_AUTOREPLY === "true") {
      const reply = autoReply(lead);
      // Best effort — the lead is already delivered.
      await resend.emails
        .send({ from: CONTACT_FROM_EMAIL, to: lead.email, subject: reply.subject, html: reply.html })
        .catch(() => undefined);
    }
    return { ok: true };
  } catch (err) {
    console.error("[submitLead] Unexpected error:", err);
    return { ok: false, error: "send" };
  }
}
