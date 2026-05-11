"use client";

import { FC, HTMLAttributes } from "react";

import { tw } from "@/tailwind";

export const CommandShortcut: FC<HTMLAttributes<HTMLSpanElement>> = ({ className, ...props }) => {
  return (
    <span
      className={tw("text-muted-foreground ml-auto text-xs tracking-widest", className)}
      {...props}
    />
  );
};
CommandShortcut.displayName = "CommandShortcut";
