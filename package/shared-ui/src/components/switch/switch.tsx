"use client";

import { Root, Thumb } from "@radix-ui/react-switch";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

import { tw } from "@/tailwind";

import { FormError } from "../form-error";
import { Label } from "../label";

export type SwitchProps = ComponentPropsWithoutRef<typeof Root> & {
  containerClassName?: string;
  error?: false | string;
  label?: string;
};

export const Switch = forwardRef<ElementRef<typeof Root>, SwitchProps>(
  ({ className, containerClassName, error, label, ...props }, ref) => (
    <div className={tw("max-w-full", containerClassName)}>
      {!!label && <Label>{label}</Label>}
      <Root
        className={tw(
          "focus-visible:ring-ring focus-visible:ring-offset-background data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
        ref={ref}
      >
        <Thumb
          className={tw(
            "bg-surface pointer-events-none block h-4 w-4 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
          )}
        />
      </Root>
      <FormError className="w-full text-end" errorText={error} />
    </div>
  ),
);
Switch.displayName = Root.displayName;
