/* eslint-disable @next/next/no-img-element -- tiny static SVGs, nothing for next/image to optimise */
import { cn } from "@/lib/cn";

/**
 * Flags as cached static SVG files (public/flags, copied from
 * `country-flag-icons`). Served as <img> rather than inline SVG: they repeat
 * ~30× on the page and some are path-heavy, which bloated the HTML.
 * Emoji flags are never used: Windows renders them as two letters ("NP").
 *  - shape="rect"  → 16×12, 2px radius (inline with text)
 *  - shape="round" → circle-cropped, 32px by default
 */
export type FlagCode = "nepal" | "indonesia" | "uzbekistan" | "kenya" | "uae" | "india";

const ISO: Record<FlagCode, string> = {
  nepal: "np",
  indonesia: "id",
  uzbekistan: "uz",
  kenya: "ke",
  uae: "ae",
  india: "in",
};

export function Flag({
  code,
  shape = "rect",
  className,
}: {
  code: FlagCode;
  shape?: "rect" | "round";
  className?: string;
}) {
  const round = shape === "round";
  // Nepal's flag is not rectangular — show it whole on white instead of cropping.
  const nonRect = code === "nepal";

  return (
    <span
      aria-hidden
      className={cn(
        "inline-block shrink-0 overflow-hidden bg-white shadow-[0_0_0_0.5px_rgb(30_24_20/0.2)]",
        round ? "size-8 rounded-full" : "h-3 w-4 rounded-[2px]",
        className,
      )}
    >
      <img
        src={`/flags/${ISO[code]}${round ? "-round" : ""}.svg`}
        alt=""
        width={round ? 32 : 16}
        height={round ? 32 : 12}
        loading="lazy"
        decoding="async"
        className={cn("block size-full", nonRect ? "object-contain" : "object-cover", nonRect && round && "scale-[0.78]")}
      />
    </span>
  );
}
