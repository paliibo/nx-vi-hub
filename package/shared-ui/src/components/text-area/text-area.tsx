import { forwardRef, TextareaHTMLAttributes } from "react";

import { tw } from "@/tailwind";

import { FormError } from "../form-error";
import { Label } from "../label";

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  containerClassName?: string;
  error?: false | string;
  label?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, containerClassName, defaultValue: _defaultValue = "", error, label, ...props }, ref) => {
    return (
      <div className={tw("max-w-full", containerClassName)}>
        {!!label && <Label>{label}</Label>}
        <textarea
          className={tw(
            "flex min-h-[60px] w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        />
        <FormError className="w-full text-end" errorText={error} />
      </div>
    );
  },
);
TextArea.displayName = "Textarea";
