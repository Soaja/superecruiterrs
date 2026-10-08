import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outlineLight";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-(--ease-out-expo) " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-offset-4";

// Ink text on orange: white on #FF6A1A is ~2.9:1 (fails AA), ink is ~6.1:1.
const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-ink shadow-brand hover:bg-brand-hover hover:shadow-brand",
  secondary:
    "border-[1.5px] border-ink/20 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-cream",
  ghost: "bg-transparent text-ink hover:bg-ink/[0.06]",
  // For dark (ink) sections
  outlineLight:
    "border-[1.5px] border-cream/25 bg-transparent text-cream hover:border-cream hover:bg-cream hover:text-ink",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[0.9375rem]",
  lg: "h-14 px-7 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  /** Trailing icon; nudges right on hover. */
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
};

type AnchorProps = CommonProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof CommonProps> & { href: string };
type NativeButtonProps = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof CommonProps> & { href?: undefined };

export type ButtonProps = AnchorProps | NativeButtonProps;

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: Pick<CommonProps, "variant" | "size" | "className"> = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

/** Renders an <a> when `href` is set, otherwise a <button>. */
export function Button(props: ButtonProps) {
  const { variant, size, icon, className, children, ...rest } = props;
  const classes = buttonClasses({ variant, size, className });
  const content = (
    <>
      <span>{children}</span>
      {icon && (
        <span
          aria-hidden
          className="inline-flex transition-transform duration-300 ease-(--ease-out-expo) group-hover/btn:translate-x-0.5"
        >
          {icon}
        </span>
      )}
    </>
  );

  if (rest.href !== undefined) {
    return (
      <a className={classes} {...(rest as ComponentPropsWithoutRef<"a">)}>
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      {...(rest as ComponentPropsWithoutRef<"button">)}
    >
      {content}
    </button>
  );
}
