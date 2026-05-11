import type { Metadata } from "next";

import { notFound } from "next/navigation";

import type { ListCategoriesResponseSchema, ListVideosResponseSchema } from "@/shared/validation";

import { EmptyState, PageHeader, PaginationControls } from "../../../components/ui";
import { VideoGrid } from "../../../components/video";
import { okOrNull, serverApi } from "../../../lib/api-server";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

const loadCategory = async (slug: string) => {
  const categories = okOrNull<ListCategoriesResponseSchema>(await serverApi.catalog.categories());
  return categories?.items.find(category => category.slug === slug) ?? null;
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const page = Math.max(1, Number(query.page ?? 1) || 1);

  const category = await loadCategory(slug);
  if (!category) notFound();

  const results = okOrNull<ListVideosResponseSchema>(
    await serverApi.videos.list({
      query: { category: slug, limit: 24, page, sort: "newest" },
    }),
  );

  const items = results?.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div
        className="border-b border-border px-4 py-10"
        style={{
          background: `linear-gradient(135deg, ${category.accentColor}22, transparent 60%)`,
        }}
      >
        <PageHeader description={category.description} eyebrow="Category" title={category.name} />
      </div>

      <div className="flex flex-col gap-6 px-4 pb-8">
        {items.length === 0 ? (
          <EmptyState
            description="Nothing has been published in this category yet."
            title="Empty for now"
          />
        ) : (
          <VideoGrid videos={items} />
        )}

        {results && (
          <PaginationControls
            buildHref={target => `/category/${slug}?page=${target}`}
            page={results.pagination.page}
            totalPages={results.pagination.totalPages}
          />
        )}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await loadCategory(slug);
  return category
    ? { description: category.description ?? undefined, title: category.name }
    : { title: "Category not found" };
}
