"use client";
import { Title } from "@radix-ui/react-dialog";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

import { tw } from "@/tailwind";

export const DialogTitle = forwardRef<
  ElementRef<typeof Title>,
  ComponentPropsWithoutRef<typeof Title>
>(({ className, ...props }, ref) => (
  <Title
    className={tw(
      "text-muted-foreground text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    ref={ref}
    {...props}
  />
));
DialogTitle.displayName = Title.displayName;
