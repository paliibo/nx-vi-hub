import type { Metadata } from "next";

import { ArchiveIcon } from "@radix-ui/react-icons";
import Link from "next/link";

import type { ListHistoryResponseSchema, ListPlaylistsResponseSchema } from "@/shared/validation";

import { EmptyState, PageHeader } from "../../components/ui";
import { VideoCard } from "../../components/video";
import { okOrNull, serverApi } from "../../lib/api-server";
import { formatRelativeTime } from "../../lib/format";

export const metadata: Metadata = { title: "Your library" };

export default async function LibraryPage() {
  const [history, playlists] = await Promise.all([
    serverApi.library
      .watchHistory({ query: { limit: 8, page: 1 } })
      .then(okOrNull<ListHistoryResponseSchema>),
    serverApi.library.listPlaylists().then(okOrNull<ListPlaylistsResponseSchema>),
  ]);

  const entries = history?.items ?? [];
  const lists = playlists?.items ?? [];

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        actions={
          <Link
            className="focus-ring rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
            href="/library/history"
          >
            Full history
          </Link>
        }
        description="Everything you have watched, liked and saved."
        title="Your library"
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-m">Recently watched</h2>

        {entries.length === 0 ? (
          <EmptyState
            action={
              <Link
                className="focus-ring rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                href="/"
              >
                Find something to watch
              </Link>
            }
            description="Videos you watch show up here so you can pick them back up."
            icon={<ArchiveIcon className="h-5 w-5" />}
            title="Nothing watched yet"
          />
        ) : (
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {entries.map(entry => (
              <VideoCard key={entry.video.id} progress={entry.progressRatio} video={entry.video} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-m">Playlists</h2>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map(playlist => (
            <li key={playlist.id}>
              <Link
                className="focus-ring flex flex-col gap-1 rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
                href={`/library/playlists/${playlist.id}`}
              >
                <span className="text-headline-s">{playlist.title}</span>
                <span className="text-muted-foreground text-body-s">
                  {playlist.itemCount} {playlist.itemCount === 1 ? "video" : "videos"} ·{" "}
                  {formatRelativeTime(playlist.updatedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
