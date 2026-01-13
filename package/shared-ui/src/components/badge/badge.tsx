import { cva, type VariantProps } from "class-variance-authority";
import { FC, HTMLAttributes } from "react";

import { tw } from "@/tailwind";

export const badgeVariants = cva(
  "inline-flex items-center rounded-md border border-border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        destructive:
          "border-transparent bg-danger text-danger-foreground shadow hover:bg-danger/80",
        outline: "text-foreground",
        secondary:
          "border-transparent bg-muted text-foreground hover:bg-muted/80",
      },
    },
  },
);

export type BadgeProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

export const Badge: FC<BadgeProps> = ({ className, variant, ...props }) => {
  return <div className={tw(badgeVariants({ variant }), className)} {...props} />;
};
