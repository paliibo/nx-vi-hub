import { FC, HTMLAttributes } from "react";

import { tw } from "@/tailwind";

export const Skeleton: FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={tw("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  );
};
