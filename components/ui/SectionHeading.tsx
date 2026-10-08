import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow } from "./Eyebrow";

type SectionHeadingProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  /** Heading level; sections use h2 by default. */
  as?: "h1" | "h2" | "h3";
  /**
   * Opt in to the scroll reveal. Parts start hidden (motion users only), so
   * the section MUST call `revealHeading()` from lib/animations.
   */
  reveal?: boolean;
  className?: string;
  id?: string;
};

/** Splits a string title into clipped words for the slide-up reveal. */
function Words({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <span key={i}>
          <span className="-mt-[0.1em] -mb-[0.16em] inline-block overflow-hidden pt-[0.1em] pb-[0.16em] align-top">
            <span data-heading-word className="inline-block">
              {word}
            </span>
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  tone = "light",
  as: Heading = "h2",
  reveal = false,
  className,
  id,
}: SectionHeadingProps) {
  const r = (attr: string) => (reveal ? { "data-reveal": "", [attr]: "" } : {});

  return (
    <div
      className={cn(
        "flex max-w-3xl flex-col gap-5",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <div {...r("data-heading-eyebrow")}>
          <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        </div>
      )}
      <Heading
        id={id}
        {...r("data-heading-title")}
        className={cn("text-h2 font-semibold", tone === "light" ? "text-ink" : "text-cream")}
      >
        {reveal && typeof title === "string" ? <Words text={title} /> : title}
      </Heading>
      {subtitle && (
        <p
          {...r("data-heading-sub")}
          className={cn("max-w-2xl text-lead", tone === "light" ? "text-muted" : "text-cream/75")}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
