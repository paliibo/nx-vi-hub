"use client";

import { tw } from "@/tailwind";
import { Description } from "@radix-ui/react-alert-dialog";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

export const AlertDialogDescription = forwardRef<
  ElementRef<typeof Description>,
  ComponentPropsWithoutRef<typeof Description>
>(({ className, ...props }, ref) => (
  <Description
    className={tw("text-sm text-muted-foreground", className)}
    ref={ref}
    {...props}
  />
));
AlertDialogDescription.displayName = Description.displayName;
