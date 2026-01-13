"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Close } from "@radix-ui/react-toast";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

import { tw } from "@/tailwind";

export const ToastClose = forwardRef<
  ElementRef<typeof Close>,
  ComponentPropsWithoutRef<typeof Close>
>(({ className, ...props }, ref) => (
  <Close
    className={tw(
      "absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-danger-foreground/70 group-[.destructive]:hover:text-danger-foreground group-[.destructive]:focus:ring-danger group-[.destructive]:focus:ring-offset-danger",
      className,
    )}
    ref={ref}
    toast-close=""
    {...props}
  >
    <Cross2Icon className="h-4 w-4" />
  </Close>
));
ToastClose.displayName = Close.displayName;
