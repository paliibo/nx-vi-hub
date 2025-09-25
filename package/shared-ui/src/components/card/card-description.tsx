import { tw } from "@/tailwind";
import { HTMLAttributes, forwardRef } from "react";

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p className={tw("text-sm text-muted-foreground", className)} ref={ref} {...props} />
));
CardDescription.displayName = "CardDescription";
