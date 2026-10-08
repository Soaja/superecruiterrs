/** Company contact details used across sections. */

// TODO: verify the phone number with the client ("+381 61 18086141" has an
// unusual number of digits for a Serbian mobile number).
export const PHONE = {
  display: "+381 61 18086141",
  href: "tel:+3816118086141",
} as const;

export const EMAIL = "info@superecruiter.rs";
// Display city comes from messages (Common.city) so EN shows "Belgrade, Serbia".
export const CITY_SR = "Beograd";

// TODO: verify — the brief gives +381611808614 for WhatsApp/Viber, which
// differs from the phone number above by one digit.
const MESSAGING_NUMBER = "381611808614";
export const WHATSAPP_HREF = `https://wa.me/${MESSAGING_NUMBER}`;
export const VIBER_HREF = `viber://chat?number=%2B${MESSAGING_NUMBER}`;

// TODO: real social profile URLs.
export const SOCIAL = {
  linkedin: "#",
  instagram: "#",
  facebook: "#",
} as const;

// TODO: confirm the production domain (used for canonical URLs, sitemap, OG).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://superecruiter.rs").replace(/\/$/, "");
