import { tw } from "@/tailwind";
import { FC, HTMLAttributes } from "react";

export const Skeleton: FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={tw("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  );
};
