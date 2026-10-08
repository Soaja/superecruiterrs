import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

type ContainerProps<T extends ElementType> = {
  as?: T;
  size?: "default" | "narrow";
} & ComponentPropsWithoutRef<T>;

/** Horizontal page gutter + max width. 16px gutter on phones. */
export function Container<T extends ElementType = "div">({
  as,
  size = "default",
  className,
  ...rest
}: ContainerProps<T>) {
  const Tag = as ?? "div";
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-10",
        size === "default" ? "max-w-[1360px]" : "max-w-[960px]",
        className,
      )}
      {...rest}
    />
  );
}
