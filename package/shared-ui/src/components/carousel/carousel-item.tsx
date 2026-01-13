"use client";
import { forwardRef, HTMLAttributes } from "react";

import { tw } from "@/tailwind";

import { useCarousel } from "./use-carousel";

export const CarouselItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { orientation } = useCarousel();

    return (
      <div
        aria-roledescription="slide"
        className={tw(
          "min-w-0 shrink-0 grow-0 basis-full",
          orientation === "horizontal" ? "pl-4" : "pt-4",
          className,
        )}
        ref={ref}
        role="group"
        {...props}
      />
    );
  },
);
CarouselItem.displayName = "CarouselItem";
