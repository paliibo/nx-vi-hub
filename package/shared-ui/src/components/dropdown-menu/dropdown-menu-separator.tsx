"use client";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

import { tw } from "@/tailwind";

export const DropdownMenuSeparator = forwardRef<
  ElementRef<typeof Separator>,
  ComponentPropsWithoutRef<typeof Separator>
>(({ className, ...props }, ref) => (
  <Separator className={tw("bg-muted -mx-1 my-1 h-px", className)} ref={ref} {...props} />
));
DropdownMenuSeparator.displayName = Separator.displayName;
