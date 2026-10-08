"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

export type Mode = "self" | "super";
const MODES: Mode[] = ["self", "super"];

/**
 * Two-option segmented control, implemented as an ARIA radiogroup
 * (roving tabindex; ←/→/↑/↓ move and select, Home/End jump).
 * The active pill slides with a CSS transform.
 */
export function ModeToggle({
  value,
  onChange,
  labels,
  ariaLabel,
  controls,
}: {
  value: Mode;
  onChange: (mode: Mode) => void;
  labels: Record<Mode, string>;
  ariaLabel: string;
  controls: string;
}) {
  const refs = useRef<Record<Mode, HTMLButtonElement | null>>({ self: null, super: null });

  const select = (mode: Mode) => {
    onChange(mode);
    refs.current[mode]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const i = MODES.indexOf(value);
    const keys: Record<string, Mode> = {
      ArrowRight: MODES[(i + 1) % 2],
      ArrowDown: MODES[(i + 1) % 2],
      ArrowLeft: MODES[(i + 1) % 2],
      ArrowUp: MODES[(i + 1) % 2],
      Home: MODES[0],
      End: MODES[1],
    };
    const next = keys[e.key];
    if (!next) return;
    e.preventDefault();
    select(next);
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className="relative grid w-full grid-cols-2 rounded-full border border-ink/10 bg-cream-soft p-1.5 shadow-soft sm:inline-grid sm:w-auto"
    >
      {/* Sliding indicator: ink for "self", orange for "super" (crossfaded). */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-1.5 left-1.5 w-[calc(50%-0.375rem)] rounded-full transition-transform duration-500 ease-(--ease-out-expo) motion-reduce:transition-none",
          value === "super" && "translate-x-full",
        )}
      >
        <span
          className={cn(
            "absolute inset-0 rounded-full bg-ink transition-opacity duration-500 motion-reduce:transition-none",
            value === "self" ? "opacity-100" : "opacity-0",
          )}
        />
        <span
          className={cn(
            "absolute inset-0 rounded-full bg-brand shadow-brand transition-opacity duration-500 motion-reduce:transition-none",
            value === "super" ? "opacity-100" : "opacity-0",
          )}
        />
      </span>

      {MODES.map((mode) => {
        const active = value === mode;
        return (
          <button
            key={mode}
            ref={(el) => {
              refs.current[mode] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            aria-controls={controls}
            tabIndex={active ? 0 : -1}
            onClick={() => select(mode)}
            className={cn(
              "relative z-10 h-12 rounded-full px-2 text-sm font-semibold whitespace-nowrap transition-colors duration-300 focus-visible:outline-offset-2 sm:h-14 sm:px-8 sm:text-base",
              active ? (mode === "self" ? "text-cream" : "text-ink") : "text-muted hover:text-ink",
            )}
          >
            {labels[mode]}
          </button>
        );
      })}
    </div>
  );
}
