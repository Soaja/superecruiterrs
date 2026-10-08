import { cn } from "@/lib/cn";

/**
 * Brand mark. Placeholder wordmark until the SVG logo arrives —
 * to swap, replace the contents of this component with the <svg>
 * (or next/image) and keep the same props. Nothing else needs to change.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-display text-[1.125rem] font-bold leading-none tracking-[-0.02em] text-ink sm:text-[1.25rem]",
        className,
      )}
    >
      SUPERECRUITER
      <span aria-hidden className="ml-0.5 inline-block size-[0.32em] rounded-full bg-brand" />
    </span>
  );
}
