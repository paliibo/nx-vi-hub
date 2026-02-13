import { PlayIcon } from "@radix-ui/react-icons";
import Link from "next/link";

import type { DiscoverResponseSchema } from "@/shared/validation";

import { EmptyState } from "../components/ui";
import { VideoPoster, VideoShelf } from "../components/video";
import { okOrNull, serverApi } from "../lib/api-server";
import { formatDuration, formatRelativeTime, formatViews } from "../lib/format";
import { getSession } from "../lib/session";

export default async function HomePage() {
  const [feed, session] = await Promise.all([
    serverApi.catalog.discover().then(okOrNull<DiscoverResponseSchema>),
    getSession(),
  ]);

  if (!feed) {
    return (
      <div className="px-4 py-10">
        <EmptyState
          description="The API is not reachable. Start it with `pnpm dev:api`, or run `docker compose up` to bring the whole stack up."
          title="Nothing to show yet"
        />
      </div>
    );
  }

  const { continueWatching, featured, fresh, fromSubscriptions, trending } = feed;

  return (
    <div className="flex flex-col gap-12 px-4 py-6 lg:py-8">
      {featured && (
        <section className="animate-fade-in relative overflow-hidden rounded-3xl border border-border">
          <div className="absolute inset-0">
            <VideoPoster
              accentColor={featured.channel.accentColor}
              seed={featured.slug}
              thumbnailUrl={featured.thumbnailUrl}
              title={featured.title}
            />
            {/* Two stacked scrims: a vertical one for the text block and a
                horizontal one so the right edge does not go flat. */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent" />
          </div>

          <div className="relative flex max-w-2xl flex-col gap-4 p-6 sm:p-10 lg:py-16">
            <p className="text-label text-primary">Most watched</p>

            <h1 className="text-display">{featured.title}</h1>

            <p className="text-sm text-muted-foreground">
              {featured.channel.name} · {formatViews(featured.views)} ·{" "}
              {formatRelativeTime(featured.publishedAt)} ·{" "}
              {formatDuration(featured.durationSeconds)}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-3">
              <Link
                className="focus-ring inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                href={`/watch/${featured.slug}`}
              >
                <PlayIcon className="h-4 w-4" />
                Watch now
              </Link>

              <Link
                className="focus-ring rounded-full border border-border-strong px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                href={`/channel/${featured.channel.handle}`}
              >
                Visit {featured.channel.name}
              </Link>
            </div>
          </div>
        </section>
      )}

      {session && (
        <VideoShelf
          description="Pick up where you stopped."
          href="/library/history"
          title="Continue watching"
          videos={continueWatching}
        />
      )}

      {session && (
        <VideoShelf
          description="Newest from the channels you follow."
          href="/subscriptions"
          title="From your subscriptions"
          videos={fromSubscriptions}
        />
      )}

      <VideoShelf
        description="What people are watching right now."
        href="/search?sort=most-viewed"
        title="Trending"
        videos={trending}
      />

      <VideoShelf
        description="Freshly published across every channel."
        href="/search?sort=newest"
        title="Just added"
        videos={fresh}
      />
    </div>
  );
}
