import { ComponentProps, forwardRef } from "react";

import { tw } from "@/tailwind";

export const PaginationItem = forwardRef<HTMLLIElement, ComponentProps<"li">>(
  ({ className, ...props }, ref) => <li className={tw("", className)} ref={ref} {...props} />,
);
PaginationItem.displayName = "PaginationItem";
