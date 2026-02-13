"use client";

import { Title } from "@radix-ui/react-alert-dialog";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

import { tw } from "@/tailwind";

export const AlertDialogTitle = forwardRef<
  ElementRef<typeof Title>,
  ComponentPropsWithoutRef<typeof Title>
>(({ className, ...props }, ref) => (
  <Title className={tw("text-lg font-semibold", className)} ref={ref} {...props} />
));
AlertDialogTitle.displayName = Title.displayName;
