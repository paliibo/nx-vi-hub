import { type ReactNode } from "react";

import { tw } from "@/tailwind";

type PageHeaderProps = {
  actions?: ReactNode;
  className?: string;
  description?: ReactNode;
  eyebrow?: string;
  title: string;
};

export const PageHeader = ({
  actions,
  className,
  description,
  eyebrow,
  title,
}: PageHeaderProps) => (
  <div className={tw("flex flex-wrap items-end justify-between gap-4", className)}>
    <div className="min-w-0">
      {eyebrow && <p className="mb-1 text-muted-foreground text-label">{eyebrow}</p>}
      <h1 className="text-headline-l">{title}</h1>
      {description && (
        <div className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</div>
      )}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);
