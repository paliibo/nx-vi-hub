import type { ListLikedResponseSchema } from "@/shared/validation";
import type { Metadata } from "next";

import { HeartIcon } from "@radix-ui/react-icons";

import { EmptyState, PageHeader, PaginationControls } from "../../../components/ui";
import { VideoGrid } from "../../../components/video";
import { okOrNull, serverApi } from "../../../lib/api-server";

export const metadata: Metadata = { title: "Liked videos" };

export default async function LikedPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const query = await searchParams;
  const page = Math.max(1, Number(query.page ?? 1) || 1);

  const liked = okOrNull<ListLikedResponseSchema>(
    await serverApi.library.liked({ query: { limit: 24, page } }),
  );

  const items = liked?.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader description="Everything you have given a thumbs up." title="Liked videos" />

      {items.length === 0 ? (
        <EmptyState
          description="Like a video and it will be collected here."
          icon={<HeartIcon className="h-5 w-5" />}
          title="Nothing liked yet"
        />
      ) : (
        <VideoGrid videos={items} />
      )}

      {liked && (
        <PaginationControls
          buildHref={target => `/library/liked?page=${target}`}
          page={liked.pagination.page}
          totalPages={liked.pagination.totalPages}
        />
      )}
    </div>
  );
}
