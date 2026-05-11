"use client";

import { Description } from "@radix-ui/react-alert-dialog";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

import { tw } from "@/tailwind";

export const AlertDialogDescription = forwardRef<
  ElementRef<typeof Description>,
  ComponentPropsWithoutRef<typeof Description>
>(({ className, ...props }, ref) => (
  <Description className={tw("text-muted-foreground text-sm", className)} ref={ref} {...props} />
));
AlertDialogDescription.displayName = Description.displayName;
