import Image from "next/image";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

import { tw } from "@/tailwind";

export const AvatarImage = forwardRef<
  ElementRef<typeof Image>,
  ComponentPropsWithoutRef<typeof Image>
>(({ className, ...props }, ref) => (
  <Image className={tw("aspect-square h-full w-full", className)} ref={ref} {...props} />
));
AvatarImage.displayName = Image.displayName;
