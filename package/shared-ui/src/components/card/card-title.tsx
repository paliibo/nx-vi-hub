import { forwardRef, HTMLAttributes, ReactNode } from "react";

import { tw } from "@/tailwind";

type CardTitleProps = Omit<HTMLAttributes<HTMLHeadingElement>, "children"> & {
  /**
   * Required. A heading with no text is announced as an empty landmark by
   * screen readers, so the type makes the omission a compile error rather than
   * a silent accessibility defect.
   */
  children: ReactNode;
};

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, className, ...props }, ref) => (
    <h3
      className={tw("font-semibold leading-none tracking-tight", className)}
      ref={ref}
      {...props}
    >
      {children}
    </h3>
  ),
);
CardTitle.displayName = "CardTitle";
