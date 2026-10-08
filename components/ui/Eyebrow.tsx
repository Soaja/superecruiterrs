import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Small pill label that sits above section titles. */
export function Eyebrow({
  children,
  className,
  tone = "light",
}: {
  children: ReactNode;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium tracking-[0.01em]",
        tone === "light"
          ? "border-ink/10 bg-cream-soft/80 text-ink"
          : "border-cream/15 bg-cream/5 text-cream",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand" />
      {children}
    </span>
  );
}
