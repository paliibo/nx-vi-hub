import { ComponentProps, forwardRef } from "react";

import { tw } from "@/tailwind";

export const PaginationContent = forwardRef<HTMLUListElement, ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul className={tw("flex flex-row items-center gap-1", className)} ref={ref} {...props} />
  ),
);
PaginationContent.displayName = "PaginationContent";
