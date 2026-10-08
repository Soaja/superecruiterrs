# TODO — client data & placeholders

Everything on the site that is a placeholder and needs real data from the client.
Copy lives in `messages/sr.json` (Serbian) **and** `messages/en.json` (English) under the same keys —
update both. Keys are written as `Namespace.key.path`.

---

## 🔴 Blocking before launch

| What | Where |
|---|---|
| Production domain (canonical URLs, sitemap, robots, OG image URLs) | `NEXT_PUBLIC_SITE_URL` env var — default in `lib/site.ts` → `SITE_URL` (`https://superecruiter.rs`) |
| Resend API key + verified sending domain | `.env.local` / hosting env: `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` (must be on a domain verified in Resend), `CONTACT_TO_EMAIL` — template in `.env.example` |
| Phone number — `+381 61 18086141` has an unusual number of digits for a Serbian mobile | `lib/site.ts` → `PHONE` |
| WhatsApp/Viber number — brief gives `+381611808614` (one digit differs from the phone above) | `lib/site.ts` → `MESSAGING_NUMBER` |
| PIB (tax ID) | `Footer.pib` |
| MB (registration number) | `Footer.mb` |
| Employment-agency licence number | `Footer.license` |
| Privacy policy text (+ cookies section, anchor `#kolacici`) | `app/[locale]/politika-privatnosti/page.tsx` → replace `<LegalPlaceholder>` (`components/layout/LegalPlaceholder.tsx`). Page is `noindex` until then. |
| Terms of use text | `app/[locale]/uslovi-koriscenja/page.tsx` → replace `<LegalPlaceholder>`. Page is `noindex` until then. |

## Brand & global

| What | Where |
|---|---|
| SVG logo (header) | `components/ui/Logo.tsx` — replace the wordmark; props stay the same |
| Logo in footer | `components/layout/Footer.tsx` (brand column) |
| Favicon / app icon (currently an orange "S" placeholder) | `app/icon.svg`, `app/favicon.ico`, `app/apple-icon.tsx` |
| Logo URL in structured data | `app/[locale]/page.tsx` → `jsonLd.logo` |
| Street address (structured data; currently only "Beograd") | `app/[locale]/page.tsx` → `jsonLd.address` |
| Social profile URLs (LinkedIn, Instagram, Facebook) — footer + structured data `sameAs` | `lib/site.ts` → `SOCIAL` |
| Working hours "Pon–Pet 09–17h" | `Footer.hours` |
| Email `info@superecruiter.rs` (confirm) | `lib/site.ts` → `EMAIL` |

## Hero

| What | Where |
|---|---|
| "XX+ poslodavaca u Srbiji nam veruje" — real number | `Hero.socialProof.count` |
| Social-proof avatars (monograms "HM", "LG", "GR") → real client logos/photos | `components/sections/hero/Hero.tsx` → `PROOF_AVATARS` |
| Main hero photo (Unsplash) | `components/sections/hero/HeroStage.tsx` → `PHOTO_MAIN` |
| Candidate avatar photo (Unsplash) | `components/sections/hero/HeroStage.tsx` → `PHOTO_AVATAR` |
| Illustrative candidate card ("Ramesh K.", "Kuvar · Nepal", "5 god. iskustva") | `Hero.stage.candidate.*` |
| Arrival card "za 42 dana" (illustrative) | `Hero.stage.arrival.*` |
| Worker profiles per country in the partner marquee (verify) | `Hero.partners.countries.<country>.profiles` |

## Industrije

| What | Where |
|---|---|
| Panel photos ×3 (Unsplash) | `components/sections/industries/data.ts` → `INDUSTRIES[].photo` |
| Position lists per industry (verify) | `Industries.items.<industry>.positions` |
| Floating cards — "Najtraženije: Kuvari", "Tim od 12 radnika" (illustrative) | `Industries.items.<industry>.card.*` |
| Team monograms on the construction card → real photos | `components/sections/industries/IndustryCard.tsx` → `TEAM` |

## Kako radimo

| What | Where |
|---|---|
| Video-call candidate photo (Unsplash) | `components/sections/process/Scenes.tsx` → `CANDIDATE_PHOTO` |
| Demo data in the scenes (names, flight "SR 612", date "14. mart", gate "B12") — illustrative, check tone | `Process.scenes.*` |

## Mreža i brojke

| What | Where |
|---|---|
| "XXX+ dovedenih radnika" | `Network.stats.workers.value` |
| "XX+ poslodavaca u Srbiji" | `Network.stats.employers.value` |
| "XX% kandidata ostaje duže od godinu dana" — or swap this stat if the client has no data | `Network.stats.retention.value` / `.label` |
| Languages per country (placeholder) | `Network.countries.<country>.languages` |
| Typical profiles per country (shared with the hero marquee) | `Hero.partners.countries.<country>.profiles` |
| Stat-tile avatar monograms → real photos | `components/sections/network/Network.tsx` → `MINI_AVATARS` |

## Usluge

| What | Where |
|---|---|
| Photo per service ×5 (Unsplash) | `components/sections/services/data.ts` → `SERVICES[].photo` |

## Reference

| What | Where |
|---|---|
| All three testimonials (quote, name, role, company, city) | `Testimonials.items[0..2]` |
| Result cards ("6 kuvara · 45 dana", "12 građevinara · Uzbekistan", "4 vozača CE · Kenija") | `Testimonials.items[i].result` |
| Workplace photos ×3 (Unsplash) + result-card flags | `components/sections/testimonials/Testimonials.tsx` → `MEDIA` |
| Company logos inside the cards (currently a dashed text placeholder) | `components/sections/testimonials/Testimonials.tsx` (person row) |
| "Poverenje nam ukazuju" logo marquee — "Klijent A–F" → real logos | `Testimonials.logos` (+ swap text for `<img>` in `Testimonials.tsx`) |

## FAQ

| What | Where |
|---|---|
| Answer 6 "Šta poslodavac treba da obezbedi?" — verify | `Faq.items[5].a` |
| Consultant photo (monogram "SR") | `components/sections/faq/FaqContent.tsx` → `ContactCard` |

## Kontakt

| What | Where |
|---|---|
| Auto-reply email copy (optional; toggle with `CONTACT_AUTOREPLY`) | `Contact.email.reply*` |
| Agency notification email recipient | `CONTACT_TO_EMAIL` env var |

## Technical follow-ups (not client data)

| What | Where |
|---|---|
| Remove the Unsplash allowance once real photos are in `/public` | `next.config.ts` → `images.remotePatterns` |
| Rate limit is in-memory (single instance) → move to Redis/Upstash if deployed on multiple instances | `lib/actions/submit-lead.ts` |
| Hook GA4 / Meta Pixel to the existing `dataLayer` event `lead_submitted` | `lib/analytics.ts` |
