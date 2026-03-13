import type {
  ChannelResponseSchema,
  ListChannelVideosResponseSchema,
} from "@/shared/validation";
import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { SubscribeButton } from "../../../components/watch/subscribe-button";
import { EmptyState, PaginationControls } from "../../../components/ui";
import { VideoGrid } from "../../../components/video";
import { okOrNull, serverApi } from "../../../lib/api-server";
import { formatCompact, formatDate } from "../../../lib/format";
import { getSession } from "../../../lib/session";

type ChannelPageProps = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: ChannelPageProps): Promise<Metadata> {
  const { handle } = await params;
  const channel = okOrNull<ChannelResponseSchema>(
    await serverApi.channels.getByHandle({ params: { handle } }),
  );
  return channel
    ? { description: channel.description ?? undefined, title: channel.name }
    : { title: "Channel not found" };
}

export default async function ChannelPage({ params, searchParams }: ChannelPageProps) {
  const [{ handle }, query] = await Promise.all([params, searchParams]);
  const page = Math.max(1, Number(query.page ?? 1) || 1);

  const channel = okOrNull<ChannelResponseSchema>(
    await serverApi.channels.getByHandle({ params: { handle } }),
  );
  if (!channel) notFound();

  const [videos, session] = await Promise.all([
    serverApi.channels
      .listVideos({ params: { handle }, query: { limit: 24, page } })
      .then(okOrNull<ListChannelVideosResponseSchema>),
    getSession(),
  ]);

  const items = videos?.items ?? [];
  const isOwner = session?.channel?.handle === handle;

  return (
    <div className="flex flex-col">
      <div
        className="h-36 w-full sm:h-48"
        style={{
          background: channel.bannerUrl
            ? `url(${channel.bannerUrl}) center/cover`
            : `linear-gradient(120deg, ${channel.accentColor}55, ${channel.accentColor}11 55%, transparent)`,
        }}
      />

      <header className="flex flex-wrap items-end gap-5 border-b border-border px-4 pb-6">
        <span
          aria-hidden="true"
          className="-mt-10 flex h-24 w-24 items-center justify-center rounded-full border-4 border-background text-2xl font-bold text-black"
          style={{ backgroundColor: channel.accentColor }}
        >
          {channel.name.slice(0, 2).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="text-headline-l">{channel.name}</h1>
          <p className="text-sm text-muted-foreground">
            @{channel.handle} · {formatCompact(channel.subscriberCount)} subscribers ·{" "}
            {channel.videoCount} videos · {formatCompact(channel.totalViews)} views
          </p>
          {channel.description && (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{channel.description}</p>
          )}
          <p className="mt-1 text-body-s text-muted-foreground">
            Joined {formatDate(channel.createdAt)}
          </p>
        </div>

        {!isOwner && (
          <SubscribeButton
            handle={channel.handle}
            isSubscribed={channel.isSubscribed}
            returnTo={`/channel/${channel.handle}`}
            subscriberCount={channel.subscriberCount}
          />
        )}
      </header>

      <div className="flex flex-col gap-6 px-4 py-6">
        {items.length === 0 ? (
          <EmptyState
            description={
              isOwner
                ? "You have not published anything yet. Head to the studio to add your first video."
                : "This channel has not published anything yet."
            }
            title="No videos"
          />
        ) : (
          <VideoGrid hideChannel videos={items} />
        )}

        {videos && (
          <PaginationControls
            buildHref={target => `/channel/${handle}?page=${target}`}
            page={videos.pagination.page}
            totalPages={videos.pagination.totalPages}
          />
        )}
      </div>
    </div>
  );
}
