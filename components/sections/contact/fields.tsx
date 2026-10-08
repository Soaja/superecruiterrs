import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

/** Shared styles for form controls on the dark contact card. */
export const inputBase =
  "w-full rounded-field border border-white/[0.12] bg-white/[0.06] px-4 text-base text-cream placeholder:text-cream/35 outline-none transition-[border-color,box-shadow,background-color] duration-200 hover:border-white/25 focus:border-brand focus:bg-white/[0.08] focus:ring-4 focus:ring-brand/25 focus-visible:outline-none aria-[invalid=true]:border-[#FF8A73]";

export function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p id={id} aria-live="polite" className={cn("mt-1.5 flex items-center gap-1.5 text-[0.8125rem] text-[#FFB4A3]", !message && "sr-only")}>
      {message && (
        <>
          <CircleAlert aria-hidden className="size-3.5 shrink-0" />
          {message}
        </>
      )}
    </p>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  requiredLabel?: string;
  error?: string;
  multiline?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
} & Omit<ComponentPropsWithoutRef<"input">, "id" | "onChange">;

export function TextField({ id, label, required, requiredLabel, error, multiline, className, ...rest }: TextFieldProps) {
  const errId = `${id}-error`;
  const shared = {
    id,
    required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": errId,
    className: cn(inputBase, multiline ? "min-h-28 resize-y py-3" : "h-12"),
  };
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-cream/85">
        {label}
        {required && (
          <span className="ml-0.5 text-brand" aria-hidden>
            *
          </span>
        )}
        {required && requiredLabel && <span className="sr-only"> ({requiredLabel})</span>}
      </label>
      {multiline ? (
        <textarea {...shared} {...(rest as ComponentPropsWithoutRef<"textarea">)} />
      ) : (
        <input {...shared} {...(rest as ComponentPropsWithoutRef<"input">)} />
      )}
      <FieldError id={errId} message={error} />
    </div>
  );
}

/** Selectable pill/card built on a real (visually hidden) radio/checkbox input. */
export function Choice({
  type,
  name,
  value,
  checked,
  onChange,
  children,
  className,
}: {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "relative min-h-11 cursor-pointer select-none rounded-full border border-white/[0.12] bg-white/[0.05] text-cream/90 transition-[border-color,background-color,color,box-shadow] duration-200",
        "hover:border-white/30 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand/40",
        checked && "border-brand bg-brand/15 text-cream",
        className,
      )}
    >
      <input type={type} name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}
