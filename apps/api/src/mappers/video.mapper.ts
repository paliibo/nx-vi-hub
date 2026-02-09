import { Prisma } from "@nx-vi-hub/db/server";

import type {
  ChannelSummarySchema,
  VideoDetailSchema,
  VideoSummarySchema,
} from "@/shared/types/db";
import type { ReactionType } from "@/shared/types/enums";

/**
 * The columns a video card needs, and nothing else. Selecting explicitly means
 * a grid of twenty cards never ships twenty descriptions over the wire.
 */
export const videoSummarySelect = {
  _count: { select: { reactions: { where: { type: "LIKE" as const } } } },
  category: {
    select: { accentColor: true, description: true, id: true, name: true, slug: true },
  },
  channel: {
    select: { accentColor: true, avatarUrl: true, handle: true, id: true, name: true },
  },
  durationSeconds: true,
  id: true,
  publishedAt: true,
  slug: true,
  thumbnailUrl: true,
  title: true,
  views: true,
} satisfies Prisma.VideoSelect;

export type VideoSummaryRow = Prisma.VideoGetPayload<{ select: typeof videoSummarySelect }>;

export const toVideoSummary = (row: VideoSummaryRow): VideoSummarySchema => ({
  category: row.category ?? null,
  channel: row.channel satisfies ChannelSummarySchema,
  durationSeconds: row.durationSeconds,
  id: row.id,
  likeCount: row._count.reactions,
  publishedAt: row.publishedAt,
  slug: row.slug,
  thumbnailUrl: row.thumbnailUrl,
  title: row.title,
  views: row.views,
});

export const videoDetailSelect = {
  ...videoSummarySelect,
  _count: {
    select: {
      comments: true,
      reactions: { where: { type: "LIKE" as const } },
    },
  },
  description: true,
  sourceUrl: true,
  tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
  visibility: true,
} satisfies Prisma.VideoSelect;

export type VideoDetailRow = Prisma.VideoGetPayload<{ select: typeof videoDetailSelect }>;

/**
 * Viewer-specific state — the reaction, the subscription, the resume point —
 * cannot come from the video row itself, so the caller resolves it separately
 * and passes it in. That keeps a single query per concern instead of one query
 * per video per viewer.
 */
export type ViewerContext = {
  dislikeCount: number;
  isSubscribed: boolean | null;
  resumeAtSeconds: number;
  viewerReaction: null | ReactionType;
};

export const toVideoDetail = (row: VideoDetailRow, viewer: ViewerContext): VideoDetailSchema => ({
  category: row.category ?? null,
  channel: row.channel,
  commentCount: row._count.comments,
  description: row.description,
  dislikeCount: viewer.dislikeCount,
  durationSeconds: row.durationSeconds,
  id: row.id,
  isSubscribed: viewer.isSubscribed,
  likeCount: row._count.reactions,
  publishedAt: row.publishedAt,
  resumeAtSeconds: viewer.resumeAtSeconds,
  slug: row.slug,
  sourceUrl: row.sourceUrl,
  tags: row.tags.map(link => link.tag),
  thumbnailUrl: row.thumbnailUrl,
  title: row.title,
  viewerReaction: viewer.viewerReaction,
  views: row.views,
  visibility: row.visibility,
});
