import { forwardRef, InputHTMLAttributes } from "react";

import { tw } from "@/tailwind";

import { FormError } from "../form-error";
import { Label } from "../label";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  containerClassName?: string;
  error?: false | string;
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      defaultValue: _defaultValue = "",
      error,
      label,
      type,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={tw("max-w-full", containerClassName)}>
        {!!label && <Label>{label}</Label>}
        <input
          className={tw(
            "text-foreground border-border placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          type={type}
          {...props}
        />
        <FormError className="w-full text-end" errorText={error} />
      </div>
    );
  },
);
Input.displayName = "Input";
