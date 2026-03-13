import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";

import { tw } from "@/tailwind";

type PaginationControlsProps = {
  /** Builds the href for a page — the caller owns the query string. */
  buildHref: (page: number) => string;
  page: number;
  totalPages: number;
};

/**
 * Window of page numbers around the current one. A catalog with 40 pages should
 * not render 40 links.
 */
const pageWindow = (page: number, totalPages: number): number[] => {
  const span = 2;
  const from = Math.max(1, Math.min(page - span, totalPages - span * 2));
  const to = Math.min(totalPages, Math.max(page + span, span * 2 + 1));
  const pages: number[] = [];
  for (let value = from; value <= to; value += 1) pages.push(value);
  return pages;
};

export const PaginationControls = ({ buildHref, page, totalPages }: PaginationControlsProps) => {
  if (totalPages <= 1) return null;

  const linkClass =
    "focus-ring flex h-10 min-w-10 items-center justify-center rounded-lg border border-border px-3 text-sm transition-colors hover:bg-muted";

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link aria-label="Previous page" className={linkClass} href={buildHref(page - 1)}>
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-disabled="true" className={tw(linkClass, "opacity-40")}>
          <ChevronLeftIcon className="h-4 w-4" />
        </span>
      )}

      {pageWindow(page, totalPages).map(value => (
        <Link
          aria-current={value === page ? "page" : undefined}
          className={tw(
            linkClass,
            value === page && "border-primary bg-primary text-primary-foreground hover:bg-primary",
          )}
          href={buildHref(value)}
          key={value}
        >
          {value}
        </Link>
      ))}

      {page < totalPages ? (
        <Link aria-label="Next page" className={linkClass} href={buildHref(page + 1)}>
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-disabled="true" className={tw(linkClass, "opacity-40")}>
          <ChevronRightIcon className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
};
