import type { Metadata } from "next";

import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Suspense } from "react";

import type { ListCategoriesResponseSchema, ListVideosResponseSchema } from "@/shared/validation";

import { SearchFilters } from "../../components/search/search-filters";
import { EmptyState, PageHeader, PaginationControls } from "../../components/ui";
import { VideoGrid } from "../../components/video";
import { okOrNull, serverApi } from "../../lib/api-server";

export const metadata: Metadata = { title: "Explore" };

type SearchPageProps = {
  searchParams: Promise<{
    category?: string;
    page?: string;
    q?: string;
    sort?: string;
    tag?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = await searchParams;
  const page = Math.max(1, Number(query.page ?? 1) || 1);

  const [results, categories] = await Promise.all([
    serverApi.videos
      .list({
        query: {
          category: query.category,
          limit: 24,
          page,
          q: query.q,
          sort: (query.sort as never) ?? "newest",
          tag: query.tag,
        },
      })
      .then(okOrNull<ListVideosResponseSchema>),
    serverApi.catalog.categories().then(okOrNull<ListCategoriesResponseSchema>),
  ]);

  const items = results?.items ?? [];
  const pagination = results?.pagination;

  const buildHref = (target: number) => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.category) params.set("category", query.category);
    if (query.tag) params.set("tag", query.tag);
    if (query.sort) params.set("sort", query.sort);
    params.set("page", String(target));
    return `/search?${params.toString()}`;
  };

  const heading = query.q ? `Results for “${query.q}”` : "Explore";

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:py-8">
      <PageHeader
        description={
          pagination
            ? `${pagination.count} ${pagination.count === 1 ? "video" : "videos"}`
            : undefined
        }
        title={heading}
      />

      {/* useSearchParams inside SearchFilters needs its own boundary, or the
          whole route opts out of server rendering. */}
      <Suspense fallback={<div className="h-16" />}>
        <SearchFilters categories={categories?.items ?? []} />
      </Suspense>

      {items.length === 0 ? (
        <EmptyState
          description={
            query.q
              ? "Nothing matched that search. Try a different word, or clear the filters."
              : "No videos match these filters yet."
          }
          icon={<MagnifyingGlassIcon className="h-5 w-5" />}
          title="No results"
        />
      ) : (
        <VideoGrid videos={items} />
      )}

      {pagination && (
        <PaginationControls
          buildHref={buildHref}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      )}
    </div>
  );
}
