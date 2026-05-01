"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { CategorySchema } from "@/shared/types";

import { VIDEO_SORT_LABELS, type VideoSort } from "@/shared/constants";
import { tw } from "@/tailwind";

type SearchFiltersProps = {
  categories: CategorySchema[];
};

/**
 * Filters are links, not form controls. That keeps every combination
 * addressable, shareable and reachable with the back button, and it works with
 * JavaScript disabled.
 */
export const SearchFilters = ({ categories }: SearchFiltersProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category");
  const activeSort = (searchParams.get("sort") ?? "newest") as VideoSort;

  const hrefWith = (updates: Record<string, null | string>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    // Any filter change invalidates the current page number.
    next.delete("page");
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const chip = (active: boolean) =>
    tw(
      "focus-ring shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
    );

  return (
    <div className="flex flex-col gap-3">
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
        <Link className={chip(!activeCategory)} href={hrefWith({ category: null })}>
          All
        </Link>
        {categories.map(category => (
          <Link
            className={chip(activeCategory === category.slug)}
            href={hrefWith({ category: category.slug })}
            key={category.id}
          >
            {category.name}
          </Link>
        ))}
      </div>

      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
        {(Object.keys(VIDEO_SORT_LABELS) as VideoSort[]).map(sort => (
          <Link
            className={tw(
              "focus-ring shrink-0 rounded-lg px-3 py-1 text-body-s transition-colors",
              activeSort === sort
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            href={hrefWith({ sort })}
            key={sort}
          >
            {VIDEO_SORT_LABELS[sort]}
          </Link>
        ))}
      </div>
    </div>
  );
};
