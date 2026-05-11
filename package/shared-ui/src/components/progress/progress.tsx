"use client";

import { Indicator, Root } from "@radix-ui/react-progress";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

import { tw } from "@/tailwind";

export const Progress = forwardRef<ElementRef<typeof Root>, ComponentPropsWithoutRef<typeof Root>>(
  ({ className, value, ...props }, ref) => (
    <Root
      className={tw("bg-primary/20 relative h-2 w-full overflow-hidden rounded-full", className)}
      ref={ref}
      {...props}
    >
      <Indicator
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </Root>
  ),
);
Progress.displayName = Root.displayName;
