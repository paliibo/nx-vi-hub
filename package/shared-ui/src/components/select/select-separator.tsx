"use client";
import { Separator } from "@radix-ui/react-select";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

import { tw } from "@/tailwind";

export const SelectSeparator = forwardRef<
  ElementRef<typeof Separator>,
  ComponentPropsWithoutRef<typeof Separator>
>(({ className, ...props }, ref) => (
  <Separator className={tw("bg-muted -mx-1 my-1 h-px", className)} ref={ref} {...props} />
));
SelectSeparator.displayName = Separator.displayName;
