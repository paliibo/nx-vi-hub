import { prisma } from "@nx-vi-hub/db/server";

import type { SearchSuggestionsQuerySchema } from "@/shared/validation";

import { RESUME_MIN_SECONDS } from "@/shared/constants";

import { toVideoSummary, videoSummarySelect } from "../mappers";

export const listCategories = async () => {
  const rows = await prisma.category.findMany({
    orderBy: { position: "asc" },
    select: {
      _count: { select: { videos: { where: { visibility: "PUBLIC" } } } },
      accentColor: true,
      description: true,
      id: true,
      name: true,
      slug: true,
    },
  });

  return {
    items: rows.map(row => ({
      accentColor: row.accentColor,
      description: row.description,
      id: row.id,
      name: row.name,
      slug: row.slug,
      videoCount: row._count.videos,
    })),
  };
};

const SHELF_SIZE = 8;

/**
 * Builds every home page shelf in one request. Doing it server-side means the
 * page is one round trip rather than five, and the shelves stay consistent with
 * each other — five separate calls could interleave with a new publication and
 * show the same video twice.
 */
export const getDiscoverFeed = async (viewerId?: string) => {
  const publicOnly = { visibility: "PUBLIC" as const };

  const [featured, trending, fresh] = await Promise.all([
    prisma.video.findFirst({
      orderBy: [{ views: "desc" }],
      select: videoSummarySelect,
      where: publicOnly,
    }),
    prisma.video.findMany({
      orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
      select: videoSummarySelect,
      take: SHELF_SIZE,
      where: publicOnly,
    }),
    prisma.video.findMany({
      orderBy: { publishedAt: "desc" },
      select: videoSummarySelect,
      take: SHELF_SIZE,
      where: publicOnly,
    }),
  ]);

  if (!viewerId) {
    return {
      continueWatching: [],
      featured: featured ? toVideoSummary(featured) : null,
      fresh: fresh.map(toVideoSummary),
      fromSubscriptions: [],
      trending: trending.map(toVideoSummary),
    };
  }

  const [history, subscriptionFeed] = await Promise.all([
    prisma.watchHistory.findMany({
      orderBy: { watchedAt: "desc" },
      select: { video: { select: videoSummarySelect } },
      take: SHELF_SIZE,
      where: {
        completed: false,
        // Anything under a few seconds is an accidental open, not something
        // worth offering to resume.
        positionSeconds: { gte: RESUME_MIN_SECONDS },
        userId: viewerId,
        video: publicOnly,
      },
    }),
    prisma.video.findMany({
      orderBy: { publishedAt: "desc" },
      select: videoSummarySelect,
      take: SHELF_SIZE,
      where: {
        ...publicOnly,
        channel: { subscriptions: { some: { userId: viewerId } } },
      },
    }),
  ]);

  return {
    continueWatching: history.map(entry => toVideoSummary(entry.video)),
    featured: featured ? toVideoSummary(featured) : null,
    fresh: fresh.map(toVideoSummary),
    fromSubscriptions: subscriptionFeed.map(toVideoSummary),
    trending: trending.map(toVideoSummary),
  };
};

export const getSuggestions = async (query: SearchSuggestionsQuerySchema) => {
  const contains = { contains: query.q, mode: "insensitive" as const };

  const [videos, channels] = await Promise.all([
    prisma.video.findMany({
      orderBy: { views: "desc" },
      select: {
        channel: { select: { name: true } },
        durationSeconds: true,
        id: true,
        slug: true,
        title: true,
      },
      take: query.limit,
      where: { title: contains, visibility: "PUBLIC" },
    }),
    prisma.channel.findMany({
      orderBy: { subscriptions: { _count: "desc" } },
      select: { accentColor: true, avatarUrl: true, handle: true, id: true, name: true },
      take: 3,
      where: { OR: [{ name: contains }, { handle: contains }] },
    }),
  ]);

  return {
    channels,
    videos: videos.map(video => ({
      channelName: video.channel.name,
      durationSeconds: video.durationSeconds,
      id: video.id,
      slug: video.slug,
      title: video.title,
    })),
  };
};
