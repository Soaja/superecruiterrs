import { siFacebook, siInstagram, siViber, siWhatsapp } from "simple-icons";

/**
 * Brand glyphs (simple-icons, CC0). lucide-react 1.x no longer ships brand
 * icons; LinkedIn was removed from simple-icons, so it's a minimal "in" mark.
 */
function Glyph({ path, className }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d={path} />
    </svg>
  );
}

export const WhatsAppIcon = ({ className }: { className?: string }) => <Glyph path={siWhatsapp.path} className={className} />;
export const ViberIcon = ({ className }: { className?: string }) => <Glyph path={siViber.path} className={className} />;
export const InstagramIcon = ({ className }: { className?: string }) => <Glyph path={siInstagram.path} className={className} />;
export const FacebookIcon = ({ className }: { className?: string }) => <Glyph path={siFacebook.path} className={className} />;

export function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <rect x="1.5" y="1.5" width="21" height="21" rx="4" fill="currentColor" />
      <text
        x="12"
        y="17.2"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fontSize="13"
        fill="var(--ink)"
      >
        in
      </text>
    </svg>
  );
}
