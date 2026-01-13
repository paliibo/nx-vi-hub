import { forwardRef, HTMLAttributes } from "react";

import { tw } from "@/tailwind";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={tw("flex flex-col p-6", className)} ref={ref} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";
