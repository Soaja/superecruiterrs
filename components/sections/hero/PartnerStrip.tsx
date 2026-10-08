import { useTranslations } from "next-intl";
import { Flag, type FlagCode } from "@/components/ui/Flag";
import { Marquee } from "@/components/ui/Marquee";

const COUNTRIES: FlagCode[] = ["nepal", "indonesia", "uzbekistan", "kenya", "uae", "india"];

/** "Partner agency network in 6 countries" — edge-to-edge marquee under the hero. */
export function PartnerStrip() {
  const t = useTranslations("Hero.partners");
  // TODO: verify worker profiles per country with the client (Hero.partners.countries).
  return (
    <div className="hero-rise pb-6 sm:pb-10" style={{ "--d": "1.2s" } as React.CSSProperties}>
      <p className="px-4 text-center text-[0.6875rem] font-semibold tracking-[0.1em] text-muted uppercase sm:text-xs sm:tracking-[0.16em]">
        {t("label")}
      </p>
      <Marquee className="mt-5">
        <ul className="flex items-center">
          {COUNTRIES.map((code) => (
            <li key={code} className="flex items-center">
              <div className="flex h-16 items-center gap-3 rounded-full border border-[#F0DCCB] bg-cream-soft/80 py-2 pr-6 pl-2.5 shadow-soft backdrop-blur-md">
                <Flag code={code} shape="round" />
                <div className="leading-tight whitespace-nowrap">
                  <p className="text-[0.9375rem] font-semibold text-ink">{t(`countries.${code}.name`)}</p>
                  <p className="mt-0.5 text-[0.8125rem] text-muted">{t(`countries.${code}.profiles`)}</p>
                </div>
              </div>
              {/* Separator after every item (incl. the last) keeps the loop seamless */}
              <span aria-hidden className="mx-5 size-1.5 rounded-full bg-brand sm:mx-7" />
            </li>
          ))}
        </ul>
      </Marquee>
    </div>
  );
}
