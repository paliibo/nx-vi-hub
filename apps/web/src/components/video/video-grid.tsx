import type { VideoSummarySchema } from "@/shared/types/db";

import { tw } from "@/tailwind";

import { VideoCard } from "./video-card";

type VideoGridProps = {
  className?: string;
  hideChannel?: boolean;
  /** Resume ratios keyed by video id, for grids that show watch progress. */
  progressByVideoId?: Record<string, number>;
  videos: VideoSummarySchema[];
};

export const VideoGrid = ({
  className,
  hideChannel,
  progressByVideoId,
  videos,
}: VideoGridProps) => (
  <div
    className={tw(
      "grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
      className,
    )}
  >
    {videos.map((video, index) => (
      <VideoCard
        // Staggering only the first row keeps the entrance from feeling slow on
        // a long page.
        className={index < 8 ? "animate-rise-in" : undefined}
        hideChannel={hideChannel}
        key={video.id}
        progress={progressByVideoId?.[video.id]}
        style={index < 8 ? { animationDelay: `${index * 40}ms` } : undefined}
        video={video}
      />
    ))}
  </div>
);
