import { Prisma } from "@nx-vi-hub/db/server";

import type {
  PlaylistSchema,
  PlaylistSummarySchema,
  WatchHistoryEntrySchema,
} from "@/shared/types/db";

import { COMPLETION_THRESHOLD } from "@/shared/constants";

import { toVideoSummary, VideoSummaryRow, videoSummarySelect } from "./video.mapper";

export const playlistSummarySelect = {
  _count: { select: { items: true } },
  description: true,
  id: true,
  /** Only the first item is needed, and only for the cover image. */
  items: {
    orderBy: { position: "asc" as const },
    select: { video: { select: { slug: true, thumbnailUrl: true } } },
    take: 1,
  },
  system: true,
  title: true,
  updatedAt: true,
  visibility: true,
} satisfies Prisma.PlaylistSelect;

export type PlaylistSummaryRow = Prisma.PlaylistGetPayload<{
  select: typeof playlistSummarySelect;
}>;

export const toPlaylistSummary = (row: PlaylistSummaryRow): PlaylistSummarySchema => ({
  description: row.description,
  id: row.id,
  itemCount: row._count.items,
  previewThumbnailUrl: row.items[0]?.video.thumbnailUrl ?? null,
  previewVideoSlug: row.items[0]?.video.slug ?? null,
  system: row.system,
  title: row.title,
  updatedAt: row.updatedAt,
  visibility: row.visibility,
});

export const playlistSelect = {
  ...playlistSummarySelect,
  items: {
    orderBy: { position: "asc" as const },
    select: {
      addedAt: true,
      id: true,
      position: true,
      video: { select: videoSummarySelect },
    },
  },
} satisfies Prisma.PlaylistSelect;

export type PlaylistRow = Prisma.PlaylistGetPayload<{ select: typeof playlistSelect }>;

export const toPlaylist = (row: PlaylistRow): PlaylistSchema => ({
  description: row.description,
  id: row.id,
  itemCount: row._count.items,
  items: row.items.map(item => ({
    addedAt: item.addedAt,
    id: item.id,
    position: item.position,
    video: toVideoSummary(item.video),
  })),
  previewThumbnailUrl: row.items[0]?.video.thumbnailUrl ?? null,
  previewVideoSlug: row.items[0]?.video.slug ?? null,
  system: row.system,
  title: row.title,
  updatedAt: row.updatedAt,
  visibility: row.visibility,
});

export const toWatchHistoryEntry = (row: {
  completed: boolean;
  positionSeconds: number;
  video: VideoSummaryRow;
  watchedAt: Date;
}): WatchHistoryEntrySchema => {
  const { durationSeconds } = row.video;
  // Guard the division: a video with no known duration would otherwise produce
  // NaN and fail response validation.
  const ratio = durationSeconds > 0 ? row.positionSeconds / durationSeconds : 0;

  return {
    completed: row.completed || ratio >= COMPLETION_THRESHOLD,
    positionSeconds: row.positionSeconds,
    progressRatio: Math.min(1, Math.max(0, ratio)),
    video: toVideoSummary(row.video),
    watchedAt: row.watchedAt,
  };
};
