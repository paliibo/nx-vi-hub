import type { VideoSummarySchema } from "@/shared/types/db";

import { ArrowRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";

import { VideoCard } from "./video-card";

type VideoShelfProps = {
  description?: string;
  /** Optional "see all" destination shown beside the heading. */
  href?: string;
  title: string;
  videos: VideoSummarySchema[];
};

/**
 * A horizontally scrolling row. Scroll snapping keeps cards aligned to the
 * gutter instead of stopping mid-card, and the scrollbar is hidden without
 * removing keyboard or trackpad scrolling.
 */
export const VideoShelf = ({ description, href, title, videos }: VideoShelfProps) => {
  if (videos.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-headline-l">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {href && (
          <Link
            className="focus-ring flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            href={href}
          >
            See all
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1">
        {videos.map(video => (
          <VideoCard
            className="w-[16rem] shrink-0 snap-start sm:w-[19rem]"
            key={video.id}
            video={video}
          />
        ))}
      </div>
    </section>
  );
};
