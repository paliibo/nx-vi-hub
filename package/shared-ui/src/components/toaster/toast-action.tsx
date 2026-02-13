"use client";

import { Action } from "@radix-ui/react-toast";
import { ComponentPropsWithoutRef, ElementRef, forwardRef, ReactElement } from "react";

import { tw } from "@/tailwind";

export type ToastActionElement = ReactElement<typeof ToastAction>;
export const ToastAction = forwardRef<
  ElementRef<typeof Action>,
  ComponentPropsWithoutRef<typeof Action>
>(({ className, ...props }, ref) => (
  <Action
    className={tw(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-border/40 group-[.destructive]:hover:border-danger/30 group-[.destructive]:hover:bg-danger group-[.destructive]:hover:text-danger-foreground group-[.destructive]:focus:ring-danger",
      className,
    )}
    ref={ref}
    {...props}
  />
));
ToastAction.displayName = Action.displayName;
