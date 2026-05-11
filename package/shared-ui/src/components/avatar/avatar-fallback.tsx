"use client";

import { Fallback } from "@radix-ui/react-avatar";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

import { tw } from "@/tailwind";

export const AvatarFallback = forwardRef<
  ElementRef<typeof Fallback>,
  ComponentPropsWithoutRef<typeof Fallback>
>(({ className, ...props }, ref) => (
  <Fallback
    className={tw(
      "bg-muted flex h-full w-full items-center justify-center rounded-full",
      className,
    )}
    ref={ref}
    {...props}
  />
));
AvatarFallback.displayName = Fallback.displayName;
