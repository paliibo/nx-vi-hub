import type { Metadata } from "next";

import { PlusIcon, VideoIcon } from "@radix-ui/react-icons";
import Link from "next/link";

import type { ListChannelVideosResponseSchema } from "@/shared/validation";

import { CreateChannelForm } from "../../components/studio/create-channel-form";
import { EmptyState, PageHeader } from "../../components/ui";
import { VideoGrid } from "../../components/video";
import { okOrNull, serverApi } from "../../lib/api-server";
import { formatCompact } from "../../lib/format";
import { requireSession } from "../../lib/session";

export const metadata: Metadata = { title: "Studio" };

export default async function StudioPage() {
  const session = await requireSession("/studio");

  // Without a channel there is nothing to manage, so the studio becomes the
  // channel-creation step instead of an empty dashboard.
  if (!session.channel) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:py-8">
        <PageHeader
          description="Publishing needs a channel. This takes a moment and can be changed later."
          eyebrow="Studio"
          title="Create your channel"
        />
        <CreateChannelForm suggestedHandle={session.username} />
      </div>
    );
  }

  const videos = okOrNull<ListChannelVideosResponseSchema>(
    await serverApi.channels.listVideos({
      params: { handle: session.channel.handle },
      query: { limit: 24, page: 1 },
    }),
  );

  const items = videos?.items ?? [];
  const totalViews = items.reduce((sum, video) => sum + video.views, 0);

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:py-8">
      <PageHeader
        actions={
          <Link
            className="focus-ring flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            href="/studio/new"
          >
            <PlusIcon className="h-4 w-4" />
            New video
          </Link>
        }
        description={
          <>
            Managing <strong className="text-foreground">{session.channel.name}</strong> ·{" "}
            {items.length} published · {formatCompact(totalViews)} views on this page
          </>
        }
        eyebrow="Studio"
        title="Your videos"
      />

      {items.length === 0 ? (
        <EmptyState
          action={
            <Link
              className="focus-ring rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              href="/studio/new"
            >
              Publish your first video
            </Link>
          }
          description="Add a video by pointing at its URL. Nothing is uploaded to this instance."
          icon={<VideoIcon className="h-5 w-5" />}
          title="No videos yet"
        />
      ) : (
        <VideoGrid hideChannel videos={items} />
      )}
    </div>
  );
}
