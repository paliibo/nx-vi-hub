import type { Metadata } from "next";

import { CounterClockwiseClockIcon } from "@radix-ui/react-icons";

import type { ListHistoryResponseSchema } from "@/shared/validation";

import { ClearHistoryButton } from "../../../components/library/clear-history-button";
import { EmptyState, PageHeader, PaginationControls } from "../../../components/ui";
import { VideoCard } from "../../../components/video";
import { okOrNull, serverApi } from "../../../lib/api-server";

export const metadata: Metadata = { title: "Watch history" };

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const query = await searchParams;
  const page = Math.max(1, Number(query.page ?? 1) || 1);

  const history = okOrNull<ListHistoryResponseSchema>(
    await serverApi.library.watchHistory({ query: { limit: 24, page } }),
  );

  const entries = history?.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        actions={entries.length > 0 ? <ClearHistoryButton /> : undefined}
        description="Every video you have opened, most recent first."
        title="Watch history"
      />

      {entries.length === 0 ? (
        <EmptyState
          description="Nothing here yet. Watch something and it will show up."
          icon={<CounterClockwiseClockIcon className="h-5 w-5" />}
          title="No history"
        />
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {entries.map(entry => (
            <VideoCard key={entry.video.id} progress={entry.progressRatio} video={entry.video} />
          ))}
        </div>
      )}

      {history && (
        <PaginationControls
          buildHref={target => `/library/history?page=${target}`}
          page={history.pagination.page}
          totalPages={history.pagination.totalPages}
        />
      )}
    </div>
  );
}
