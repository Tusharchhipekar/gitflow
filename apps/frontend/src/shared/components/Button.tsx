import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:opacity-90",
  secondary:
    "bg-surface-container-high text-on-surface border border-outline-variant hover:bg-surface-container-highest",
  ghost: "bg-transparent text-on-surface hover:bg-surface-container",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-body-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";