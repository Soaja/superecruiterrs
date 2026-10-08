import { useTranslations } from "next-intl";
import { Mail, MapPin, Phone } from "lucide-react";
import { WhatsAppIcon, ViberIcon } from "@/components/ui/BrandIcons";
import { glassDark } from "@/components/ui/glass";
import { cn } from "@/lib/cn";
import { EMAIL, PHONE, VIBER_HREF, WHATSAPP_HREF } from "@/lib/site";

export function DirectContact({ className }: { className?: string }) {
  const t = useTranslations("Contact.direct");
  const tc = useTranslations("Common");
  const link =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium text-cream transition-colors hover:bg-white/[0.06]";
  return (
    <div className={cn(glassDark, "rounded-[24px] p-5", className)}>
      <p className="mb-2 px-3 text-xs font-semibold tracking-[0.14em] text-muted-dark uppercase">{t("title")}</p>
      <a href={PHONE.href} className={link}>
        <Phone aria-hidden className="size-4 text-brand" />
        {PHONE.display}
      </a>
      <a href={`mailto:${EMAIL}`} className={link}>
        <Mail aria-hidden className="size-4 text-brand" />
        {EMAIL}
      </a>
      <p className={cn(link, "hover:bg-transparent")}>
        <MapPin aria-hidden className="size-4 text-brand" />
        {tc("city")}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-ink transition-opacity hover:opacity-90"
        >
          <WhatsAppIcon className="size-4" />
          {t("whatsapp")}
        </a>
        <a
          href={VIBER_HREF}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#7360F2] text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <ViberIcon className="size-4" />
          {t("viber")}
        </a>
      </div>
    </div>
  );
}
