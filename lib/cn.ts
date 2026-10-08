import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge our custom tokens so e.g. `text-display` (size)
// and `text-ink` (color) don't get treated as conflicting.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display", "h1", "h2", "h3", "lead"],
      color: ["brand", "brand-hover", "brand-deep", "cream", "cream-soft", "ink", "peach", "peach-tint", "muted", "muted-dark", "line"],
      radius: ["field", "snippet", "card", "panel", "section"],
      shadow: ["soft", "lift", "float", "brand"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
