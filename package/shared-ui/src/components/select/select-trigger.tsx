"use client";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Icon, Trigger } from "@radix-ui/react-select";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

import { tw } from "@/tailwind";

export const SelectTrigger = forwardRef<
  ElementRef<typeof Trigger>,
  ComponentPropsWithoutRef<typeof Trigger>
>(({ children, className, ...props }, ref) => (
  <Trigger
    className={tw(
      "[&>span]:text-foreground border-border ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className,
    )}
    ref={ref}
    {...props}
  >
    {children}
    <Icon asChild>
      <CaretSortIcon className="h-4 w-4 opacity-50" />
    </Icon>
  </Trigger>
));
SelectTrigger.displayName = Trigger.displayName;
