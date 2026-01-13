"use client";

import { Item } from "@radix-ui/react-toggle-group";
import { VariantProps } from "class-variance-authority";
import { ComponentPropsWithoutRef, ElementRef, forwardRef, useContext } from "react";

import { tw } from "@/tailwind";

import { toggleVariants } from "../toggle/toggle";
import { ToggleGroupContext } from "./toggle-group-context";

export const ToggleGroupItem = forwardRef<
  ElementRef<typeof Item>,
  ComponentPropsWithoutRef<typeof Item> & VariantProps<typeof toggleVariants>
>(({ children, className, size, variant, ...props }, ref) => {
  const context = useContext(ToggleGroupContext);

  return (
    <Item
      className={tw(
        toggleVariants({
          size: context.size || size,
          variant: context.variant || variant,
        }),
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </Item>
  );
});

ToggleGroupItem.displayName = Item.displayName;
