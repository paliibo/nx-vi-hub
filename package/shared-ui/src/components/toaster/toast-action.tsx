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
      "border-border hover:bg-muted focus:ring-ring group-[.destructive]:border-border/40 group-[.destructive]:hover:border-danger/30 group-[.destructive]:hover:bg-danger group-[.destructive]:hover:text-danger-foreground group-[.destructive]:focus:ring-danger inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-1 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  />
));
ToastAction.displayName = Action.displayName;
