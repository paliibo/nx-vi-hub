import type { Metadata } from "next";

import { notFound } from "next/navigation";

import type {
  ListCommentsResponseSchema,
  RelatedVideosResponseSchema,
  VideoDetailResponseSchema,
} from "@/shared/validation";
import type { ChannelResponseSchema } from "@/shared/validation";

import { okOrNull, serverApi } from "../../../lib/api-server";
import { parseTimestampParam } from "../../../lib/format";
import { getSession } from "../../../lib/session";
import { WatchView } from "./watch-view";

type WatchPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string }>;
};

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  const { slug } = await params;
  const video = okOrNull<VideoDetailResponseSchema>(
    await serverApi.videos.getBySlug({ params: { slug } }),
  );

  if (!video) return { title: "Video not found" };

  return {
    description: video.description.slice(0, 160) || `Watch ${video.title} on Vi Hub.`,
    openGraph: {
      description: video.description.slice(0, 160),
      title: video.title,
      type: "video.other",
    },
    title: video.title,
  };
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  const video = okOrNull<VideoDetailResponseSchema>(
    await serverApi.videos.getBySlug({ params: { slug } }),
  );

  if (!video) notFound();

  // Everything else can be fetched at once — none of it depends on the others.
  const [related, comments, channel, session] = await Promise.all([
    serverApi.videos.related({ params: { slug } }).then(okOrNull<RelatedVideosResponseSchema>),
    serverApi.comments
      .list({ params: { slug }, query: { limit: 10, page: 1 } })
      .then(okOrNull<ListCommentsResponseSchema>),
    serverApi.channels
      .getByHandle({ params: { handle: video.channel.handle } })
      .then(okOrNull<ChannelResponseSchema>),
    getSession(),
  ]);

  // A ?t= in the link wins over the saved position: someone shared a moment and
  // that is where the viewer expects to land.
  const sharedTimestamp = parseTimestampParam(query.t);
  const resumeAtSeconds = sharedTimestamp > 0 ? sharedTimestamp : video.resumeAtSeconds;

  return (
    <WatchView
      channelSubscribers={channel?.subscriberCount ?? 0}
      comments={comments?.items ?? []}
      commentTotal={comments?.pagination.count ?? 0}
      related={related?.items ?? []}
      resumeAtSeconds={resumeAtSeconds}
      session={session}
      video={video}
    />
  );
}
