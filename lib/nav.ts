/**
 * Section anchors shared by the header and the sections themselves.
 * Ids are identical in both locales so links never break.
 */
export const NAV_ITEMS = [
  { key: "services", id: "usluge" },
  { key: "industries", id: "industrije" },
  { key: "process", id: "kako-radimo" },
  // "O nama" points at the "Naša mreža" section (who we are + network)
  { key: "about", id: "mreza" },
  { key: "faq", id: "faq" },
  { key: "contact", id: "kontakt" },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]["key"];

export const CONTACT_ANCHOR = "#kontakt";
export const PROCESS_ANCHOR = "#kako-radimo";
