import { type ReactNode } from "react";

import { tw } from "@/tailwind";

type EmptyStateProps = {
  action?: ReactNode;
  className?: string;
  description: string;
  icon?: ReactNode;
  title: string;
};

/**
 * The empty state is the first thing a new account sees on most pages, so it
 * gets a real design rather than a centred sentence.
 */
export const EmptyState = ({ action, className, description, icon, title }: EmptyStateProps) => (
  <div
    className={tw(
      "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center",
      className,
    )}
  >
    {icon && (
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
    )}
    <h2 className="text-headline-m">{title}</h2>
    <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
    {action && <div className="mt-2">{action}</div>}
  </div>
);
