"use client";

import { FC, HTMLAttributes } from "react";

import { tw } from "@/tailwind";

export const AlertDialogHeader: FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={tw("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";
