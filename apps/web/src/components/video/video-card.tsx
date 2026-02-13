import type { CSSProperties } from "react";

import Link from "next/link";

import type { VideoSummarySchema } from "@/shared/types/db";

import { tw } from "@/tailwind";

import { describeDuration, formatDuration, formatRelativeTime, formatViews } from "../../lib/format";
import { VideoPoster } from "./video-poster";

type VideoCardProps = {
  className?: string;
  /** Hides the channel line on a channel's own page, where it is redundant. */
  hideChannel?: boolean;
  /** 0–1. Draws a resume bar across the poster for part-watched videos. */
  progress?: number;
  /** Used by grids to stagger the entrance animation. */
  style?: CSSProperties;
  video: VideoSummarySchema;
};

export const VideoCard = ({ className, hideChannel, progress, style, video }: VideoCardProps) => (
  <article className={tw("group flex flex-col gap-2.5", className)} style={style}>
    <Link
      className="focus-ring relative block aspect-video overflow-hidden rounded-xl bg-muted"
      href={`/watch/${video.slug}`}
      tabIndex={-1}
    >
      <VideoPoster
        accentColor={video.channel.accentColor}
        className="transition-transform duration-500 ease-out-expo group-hover:scale-[1.03]"
        seed={video.slug}
        thumbnailUrl={video.thumbnailUrl}
        title={video.title}
      />

      <span className="absolute bottom-2 right-2 rounded bg-overlay/80 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white">
        <span aria-hidden="true">{formatDuration(video.durationSeconds)}</span>
        <span className="sr-only">{describeDuration(video.durationSeconds)}</span>
      </span>

      {progress !== undefined && progress > 0 && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1 bg-overlay/60"
        >
          <span
            className="block h-full bg-primary"
            style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
          />
        </span>
      )}
    </Link>

    <div className="flex min-w-0 flex-col gap-1">
      <h3 className="text-headline-s line-clamp-2">
        <Link className="focus-ring rounded transition-colors hover:text-primary" href={`/watch/${video.slug}`}>
          {video.title}
        </Link>
      </h3>

      {!hideChannel && (
        <Link
          className="focus-ring w-fit rounded text-sm text-muted-foreground transition-colors hover:text-foreground"
          href={`/channel/${video.channel.handle}`}
        >
          {video.channel.name}
        </Link>
      )}

      <p className="text-body-s text-muted-foreground">
        {formatViews(video.views)} · {formatRelativeTime(video.publishedAt)}
      </p>
    </div>
  </article>
);
