"use client";
import { tw } from "@/tailwind";
import { Description } from "@radix-ui/react-dialog";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

export const DialogDescription = forwardRef<
  ElementRef<typeof Description>,
  ComponentPropsWithoutRef<typeof Description>
>(({ className, ...props }, ref) => (
  <Description
    className={tw("text-sm text-muted-foreground", className)}
    ref={ref}
    {...props}
  />
));
DialogDescription.displayName = Description.displayName;
