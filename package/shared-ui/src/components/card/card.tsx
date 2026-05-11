import { forwardRef, HTMLAttributes } from "react";

import { tw } from "@/tailwind";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={tw("border-border bg-surface text-foreground rounded-xl border shadow", className)}
      ref={ref}
      {...props}
    />
  ),
);
Card.displayName = "Card";
