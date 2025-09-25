import { tw } from "@/tailwind";
import { HTMLAttributes, forwardRef } from "react";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={tw(
        "rounded-xl border border-border bg-surface text-foreground shadow",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Card.displayName = "Card";
