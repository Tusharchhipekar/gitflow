import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, icon, error, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-label-sm text-on-surface-variant">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary",
            icon ? "pl-10" : undefined,
            className,
          )}
          {...props}
        />
      </div>
      {error && <span className="text-label-sm text-error">{error}</span>}
    </div>
  ),
);
Input.displayName = "Input";