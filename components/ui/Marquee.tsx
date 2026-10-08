import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Edge-to-edge infinite marquee with soft fade masks. Renders `children`
 * (a row of items) twice and slides the track by -50%; pauses on hover.
 * Reduced motion: static, horizontally scrollable row (no duplicate).
 * Give the last item trailing spacing so the loop seam is invisible.
 */
export function Marquee({
  children,
  duration = 40,
  className,
}: {
  children: ReactNode;
  duration?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group/marquee overflow-hidden py-3",
        "[mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]",
        "motion-reduce:overflow-x-auto motion-reduce:px-4 motion-reduce:[mask-image:none]",
        className,
      )}
    >
      <div
        className="flex w-max animate-[marquee_var(--marquee-duration)_linear_infinite] group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div aria-hidden className="flex shrink-0 items-center motion-reduce:hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
