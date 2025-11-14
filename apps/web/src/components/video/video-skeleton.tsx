import { tw } from "@/tailwind";

/** One card's worth of placeholder, matching VideoCard's geometry exactly. */
export const VideoCardSkeleton = ({ className }: { className?: string }) => (
  <div className={tw("flex flex-col gap-2.5", className)}>
    <div className="aspect-video animate-smooth-pulse rounded-xl bg-muted" />
    <div className="flex flex-col gap-2">
      <div className="h-4 w-11/12 animate-smooth-pulse rounded bg-muted" />
      <div className="h-3 w-2/5 animate-smooth-pulse rounded bg-muted" />
      <div className="h-3 w-1/3 animate-smooth-pulse rounded bg-muted" />
    </div>
  </div>
);

export const VideoGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
    {Array.from({ length: count }, (_, index) => (
      <VideoCardSkeleton key={index} />
    ))}
  </div>
);
