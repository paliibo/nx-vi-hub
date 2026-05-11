"use client";

import { Root } from "@radix-ui/react-separator";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

import { tw } from "@/tailwind";

export const Separator = forwardRef<ElementRef<typeof Root>, ComponentPropsWithoutRef<typeof Root>>(
  ({ className, decorative = true, orientation = "horizontal", ...props }, ref) => (
    <Root
      className={tw(
        "bg-muted shrink-0",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className,
      )}
      decorative={decorative}
      orientation={orientation}
      ref={ref}
      {...props}
    />
  ),
);
Separator.displayName = Root.displayName;
