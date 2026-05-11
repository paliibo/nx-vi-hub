import { FC, HTMLAttributes } from "react";

import { tw } from "@/tailwind";

export const Skeleton: FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return <div className={tw("bg-primary/10 animate-pulse rounded-md", className)} {...props} />;
};
