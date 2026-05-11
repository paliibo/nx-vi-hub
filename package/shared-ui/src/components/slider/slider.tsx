"use client";

import { Range, Root, Thumb, Track } from "@radix-ui/react-slider";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

import { tw } from "@/tailwind";

export const Slider = forwardRef<ElementRef<typeof Root>, ComponentPropsWithoutRef<typeof Root>>(
  ({ className, ...props }, ref) => (
    <Root
      className={tw("relative flex w-full touch-none select-none items-center", className)}
      ref={ref}
      {...props}
    >
      <Track className="bg-primary/20 relative h-1.5 w-full grow overflow-hidden rounded-full">
        <Range className="bg-primary absolute h-full" />
      </Track>
      <Thumb className="border-border border-border-strong/50 bg-surface focus-visible:ring-ring block h-4 w-4 rounded-full border shadow transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50" />
    </Root>
  ),
);
Slider.displayName = Root.displayName;
