import { tw } from "@/tailwind";
import { InputHTMLAttributes, forwardRef } from "react";

import { FormError } from "../form-error";
import { Label } from "../label";

export type InputProps = {
  containerClassName?: string;
  error?: false | string;
  label?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, containerClassName, defaultValue = "", error, label, type, ...props }, ref) => {
    return (
      <div className={tw("max-w-full", containerClassName)}>
        {!!label && <Label>{label}</Label>}
        <input
          className={tw(
            "text-foreground flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
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
