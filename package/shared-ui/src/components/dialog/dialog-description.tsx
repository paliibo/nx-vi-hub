"use client";
import { Description } from "@radix-ui/react-dialog";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

import { tw } from "@/tailwind";

export const DialogDescription = forwardRef<
  ElementRef<typeof Description>,
  ComponentPropsWithoutRef<typeof Description>
>(({ className, ...props }, ref) => (
  <Description className={tw("text-muted-foreground text-sm", className)} ref={ref} {...props} />
));
DialogDescription.displayName = Description.displayName;
