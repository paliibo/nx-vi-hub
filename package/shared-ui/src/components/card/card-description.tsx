import { forwardRef, HTMLAttributes } from "react";

import { tw } from "@/tailwind";

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p className={tw("text-sm text-muted-foreground", className)} ref={ref} {...props} />
));
CardDescription.displayName = "CardDescription";
