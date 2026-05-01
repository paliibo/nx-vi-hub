"use client";

import Link from "next/link";
import { useState } from "react";

import type {
  CommentThreadSchema,
  SessionUserSchema,
  VideoDetailSchema,
  VideoSummarySchema,
} from "@/shared/types";

import { tw } from "@/tailwind";

import { CommentList } from "../../../components/comments/comment-list";
import { VideoCard } from "../../../components/video";
import { SubscribeButton } from "../../../components/watch/subscribe-button";
import { VideoActions } from "../../../components/watch/video-actions";
import { VideoPlayer } from "../../../components/watch/video-player";
import { formatDate, formatViews } from "../../../lib/format";

type WatchViewProps = {
  channelSubscribers: number;
  comments: CommentThreadSchema[];
  commentTotal: number;
  related: VideoSummarySchema[];
  resumeAtSeconds: number;
  session: null | SessionUserSchema;
  video: VideoDetailSchema;
};

export const WatchView = ({
  channelSubscribers,
  comments,
  commentTotal,
  related,
  resumeAtSeconds,
  session,
  video,
}: WatchViewProps) => {
  const [theatre, setTheatre] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);

  return (
    <div
      className={tw(
        "mx-auto grid w-full gap-8 px-4 py-6",
        // Theatre mode drops the sidebar and lets the player use the full width.
        theatre ? "max-w-[110rem]" : "max-w-[110rem] xl:grid-cols-[minmax(0,1fr)_22rem]",
      )}
    >
      <div className="flex min-w-0 flex-col gap-4">
        <VideoPlayer
          accentColor={video.channel.accentColor}
          durationSeconds={video.durationSeconds}
          onTheatreToggle={() => setTheatre(value => !value)}
          resumeAtSeconds={resumeAtSeconds}
          signedIn={Boolean(session)}
          slug={video.slug}
          sourceUrl={video.sourceUrl}
          thumbnailUrl={video.thumbnailUrl}
          title={video.title}
        />

        <h1 className="text-headline-l">{video.title}</h1>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              className="focus-ring flex items-center gap-3 rounded-lg"
              href={`/channel/${video.channel.handle}`}
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-black"
                style={{ backgroundColor: video.channel.accentColor }}
              >
                {video.channel.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium">{video.channel.name}</span>
                <span className="text-body-s text-muted-foreground">@{video.channel.handle}</span>
              </span>
            </Link>

            <SubscribeButton
              handle={video.channel.handle}
              isSubscribed={video.isSubscribed}
              returnTo={`/watch/${video.slug}`}
              subscriberCount={channelSubscribers}
            />
          </div>

          <VideoActions signedIn={Boolean(session)} video={video} />
        </div>

        <div className="rounded-xl bg-muted/60 p-4">
          <p className="text-sm font-medium">
            {formatViews(video.views)} · {formatDate(video.publishedAt)}
          </p>

          <p
            className={tw(
              "mt-2 whitespace-pre-wrap text-sm text-muted-foreground",
              !descriptionOpen && "line-clamp-2",
            )}
          >
            {video.description || "No description."}
          </p>

          {video.tags.length > 0 && descriptionOpen && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {video.tags.map(tag => (
                <li key={tag.id}>
                  <Link
                    className="focus-ring rounded-full bg-background px-3 py-1 text-body-s text-muted-foreground transition-colors hover:text-foreground"
                    href={`/search?tag=${tag.slug}`}
                  >
                    #{tag.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {(video.description.length > 140 || video.tags.length > 0) && (
            <button
              className="focus-ring mt-2 rounded text-body-s font-medium text-foreground"
              onClick={() => setDescriptionOpen(value => !value)}
              type="button"
            >
              {descriptionOpen ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        <CommentList
          initialThreads={comments}
          session={session}
          slug={video.slug}
          total={commentTotal}
        />
      </div>

      <aside className={tw("flex flex-col gap-4", theatre && "hidden")}>
        <h2 className="text-headline-s">Up next</h2>
        {related.map(item => (
          <VideoCard key={item.id} video={item} />
        ))}
      </aside>
    </div>
  );
};
