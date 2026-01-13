"use client";
import { Label } from "@radix-ui/react-select";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

import { tw } from "@/tailwind";

export const SelectLabel = forwardRef<
  ElementRef<typeof Label>,
  ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => (
  <Label className={tw("px-2 py-1.5 text-sm font-semibold", className)} ref={ref} {...props} />
));
SelectLabel.displayName = Label.displayName;
