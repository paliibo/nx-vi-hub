"use client";
import { Separator } from "@radix-ui/react-context-menu";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

import { tw } from "@/tailwind";

export const ContextMenuSeparator = forwardRef<
  ElementRef<typeof Separator>,
  ComponentPropsWithoutRef<typeof Separator>
>(({ className, ...props }, ref) => (
  <Separator
    className={tw("-mx-1 my-1 h-px bg-muted", className)}
    ref={ref}
    {...props}
  />
));
ContextMenuSeparator.displayName = Separator.displayName;
