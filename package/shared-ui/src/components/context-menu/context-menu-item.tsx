"use client";
import { tw } from "@/tailwind";
import { Item } from "@radix-ui/react-context-menu";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

export const ContextMenuItem = forwardRef<
  ElementRef<typeof Item>,
  {
    inset?: boolean;
  } & ComponentPropsWithoutRef<typeof Item>
>(({ className, inset, ...props }, ref) => (
  <Item
    className={tw(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className,
    )}
    ref={ref}
    {...props}
  />
));
ContextMenuItem.displayName = Item.displayName;
