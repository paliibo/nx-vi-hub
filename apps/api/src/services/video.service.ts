import type {
  CreateVideoBodySchema,
  ListVideosQuerySchema,
  ReactBodySchema,
  RecordProgressBodySchema,
  UpdateVideoBodySchema,
} from "@/shared/validation";

import { COMPLETION_THRESHOLD, VIDEO_SORT, VideoSort } from "@/shared/constants";
import { ForbiddenError, NotFoundError, getPaginatedResponse } from "@/shared/utils";
import { Prisma, prisma } from "@nx-vi-hub/db/server";

import { toVideoDetail, toVideoSummary, videoDetailSelect, videoSummarySelect } from "../mappers";
import { uniqueSlug } from "../utils/slug";

const ORDER_BY: Record<VideoSort, Prisma.VideoOrderByWithRelationInput[]> = {
  [VIDEO_SORT.MOST_VIEWED]: [{ views: "desc" }, { publishedAt: "desc" }],
  [VIDEO_SORT.NEWEST]: [{ publishedAt: "desc" }],
  [VIDEO_SORT.OLDEST]: [{ publishedAt: "asc" }],
  // Prisma can order by a relation count, which keeps ranking in Postgres
  // rather than fetching every row to sort in memory.
  [VIDEO_SORT.TOP_RATED]: [{ reactions: { _count: "desc" } }, { views: "desc" }],
};

const buildWhere = (query: ListVideosQuerySchema): Prisma.VideoWhereInput => {
  const where: Prisma.VideoWhereInput = { visibility: "PUBLIC" };

  if (query.category) where.category = { slug: query.category };
  if (query.channel) where.channel = { handle: query.channel };
  if (query.tag) where.tags = { some: { tag: { slug: query.tag } } };

  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } },
      { channel: { name: { contains: query.q, mode: "insensitive" } } },
    ];
  }

  return where;
};

export const listVideos = async (query: ListVideosQuerySchema) => {
  const where = buildWhere(query);
  const skip = (query.page - 1) * query.limit;

  const [rows, count] = await prisma.$transaction([
    prisma.video.findMany({
      orderBy: ORDER_BY[query.sort],
      select: videoSummarySelect,
      skip,
      take: query.limit,
      where,
    }),
    prisma.video.count({ where }),
  ]);

  return getPaginatedResponse(rows.map(toVideoSummary), {
    count,
    limit: query.limit,
    page: query.page,
  });
};

/**
 * Private videos are visible to their owner only; unlisted ones are readable by
 * anyone holding the link, which is the whole point of the setting.
 */
const assertVisible = (
  video: { channel: { id: string }; visibility: string },
  ownerChannelId?: string,
) => {
  if (video.visibility !== "PRIVATE") return;
  if (!ownerChannelId || ownerChannelId !== video.channel.id) {
    throw new NotFoundError("Video");
  }
};

export const getVideoBySlug = async (slug: string, viewerId?: string) => {
  const video = await prisma.video.findUnique({ select: videoDetailSelect, where: { slug } });
  if (!video) throw new NotFoundError("Video");

  const viewerChannel = viewerId
    ? await prisma.channel.findUnique({ select: { id: true }, where: { ownerId: viewerId } })
    : null;

  assertVisible(video, viewerChannel?.id);

  // Everything viewer-specific in one round trip rather than four sequential ones.
  const [dislikeCount, reaction, subscription, history] = await Promise.all([
    prisma.reaction.count({ where: { type: "DISLIKE", videoId: video.id } }),
    viewerId
      ? prisma.reaction.findUnique({
          select: { type: true },
          where: { userId_videoId: { userId: viewerId, videoId: video.id } },
        })
      : null,
    viewerId
      ? prisma.subscription.findUnique({
          select: { userId: true },
          where: { userId_channelId: { channelId: video.channel.id, userId: viewerId } },
        })
      : null,
    viewerId
      ? prisma.watchHistory.findUnique({
          select: { completed: true, positionSeconds: true },
          where: { userId_videoId: { userId: viewerId, videoId: video.id } },
        })
      : null,
  ]);

  return toVideoDetail(video, {
    dislikeCount,
    isSubscribed: viewerId ? Boolean(subscription) : null,
    // A finished video resumes from the start; nobody wants to reopen it on the
    // credits.
    resumeAtSeconds: history && !history.completed ? history.positionSeconds : 0,
    viewerReaction: reaction?.type ?? null,
  });
};

export const getRelatedVideos = async (slug: string, limit = 8) => {
  const video = await prisma.video.findUnique({
    select: {
      categoryId: true,
      channelId: true,
      id: true,
      tags: { select: { tagId: true } },
    },
    where: { slug },
  });
  if (!video) throw new NotFoundError("Video");

  const tagIds = video.tags.map(tag => tag.tagId);

  const rows = await prisma.video.findMany({
    orderBy: [{ views: "desc" }],
    select: videoSummarySelect,
    take: limit,
    where: {
      id: { not: video.id },
      visibility: "PUBLIC",
      OR: [
        { categoryId: video.categoryId },
        { tags: { some: { tagId: { in: tagIds } } } },
        { channelId: video.channelId },
      ],
    },
  });

  return { items: rows.map(toVideoSummary) };
};

export const reactToVideo = async (
  slug: string,
  userId: string,
  body: ReactBodySchema,
) => {
  const video = await prisma.video.findUnique({ select: { id: true }, where: { slug } });
  if (!video) throw new NotFoundError("Video");

  if (body.type === null) {
    await prisma.reaction.deleteMany({ where: { userId, videoId: video.id } });
  } else {
    await prisma.reaction.upsert({
      create: { type: body.type, userId, videoId: video.id },
      update: { type: body.type },
      where: { userId_videoId: { userId, videoId: video.id } },
    });
  }

  const [likeCount, dislikeCount] = await prisma.$transaction([
    prisma.reaction.count({ where: { type: "LIKE", videoId: video.id } }),
    prisma.reaction.count({ where: { type: "DISLIKE", videoId: video.id } }),
  ]);

  return { dislikeCount, likeCount, viewerReaction: body.type };
};

export const registerView = async (slug: string) => {
  const video = await prisma.video.update({
    data: { views: { increment: 1 } },
    select: { views: true },
    where: { slug },
  }).catch(() => null);

  if (!video) throw new NotFoundError("Video");
  return { views: video.views };
};

export const recordProgress = async (
  slug: string,
  userId: string,
  body: RecordProgressBodySchema,
) => {
  const video = await prisma.video.findUnique({
    select: { durationSeconds: true, id: true },
    where: { slug },
  });
  if (!video) throw new NotFoundError("Video");

  // Clamp: a seek past the end, or a stale request arriving after the duration
  // changed, should not store a position beyond the video.
  const positionSeconds = Math.max(
    0,
    Math.min(body.positionSeconds, video.durationSeconds || body.positionSeconds),
  );
  const completed =
    video.durationSeconds > 0 && positionSeconds / video.durationSeconds >= COMPLETION_THRESHOLD;

  await prisma.watchHistory.upsert({
    create: { completed, positionSeconds, userId, videoId: video.id },
    update: { completed, positionSeconds, watchedAt: new Date() },
    where: { userId_videoId: { userId, videoId: video.id } },
  });

  return { completed, positionSeconds };
};

const resolveOwnedChannel = async (userId: string) => {
  const channel = await prisma.channel.findUnique({
    select: { id: true },
    where: { ownerId: userId },
  });
  if (!channel) {
    throw new ForbiddenError("Create a channel before publishing videos");
  }
  return channel;
};

const connectTags = async (names: string[]) => {
  const tags = await Promise.all(
    names.map(name => {
      const slug = uniqueSlug(name);
      return prisma.tag.upsert({
        create: { name, slug },
        select: { id: true },
        update: {},
        where: { slug },
      });
    }),
  );
  return tags;
};

export const createVideo = async (userId: string, body: CreateVideoBodySchema) => {
  const channel = await resolveOwnedChannel(userId);

  const existingSlugs = await prisma.video.findMany({
    select: { slug: true },
    where: { slug: { startsWith: uniqueSlug(body.title) } },
  });

  const slug = uniqueSlug(
    body.title,
    existingSlugs.map(video => video.slug),
  );

  const category = body.categorySlug
    ? await prisma.category.findUnique({ select: { id: true }, where: { slug: body.categorySlug } })
    : null;

  const tags = await connectTags(body.tags);

  const video = await prisma.video.create({
    data: {
      categoryId: category?.id ?? null,
      channelId: channel.id,
      description: body.description,
      durationSeconds: body.durationSeconds,
      slug,
      sourceUrl: body.sourceUrl ?? null,
      tags: { create: tags.map(tag => ({ tagId: tag.id })) },
      thumbnailUrl: body.thumbnailUrl ?? null,
      title: body.title,
      visibility: body.visibility,
    },
    select: { slug: true },
  });

  return getVideoBySlug(video.slug, userId);
};

const assertOwnsVideo = async (slug: string, userId: string) => {
  const video = await prisma.video.findUnique({
    select: { channel: { select: { ownerId: true } }, id: true },
    where: { slug },
  });
  if (!video) throw new NotFoundError("Video");
  if (video.channel.ownerId !== userId) throw new ForbiddenError("This video is not yours");
  return video;
};

export const updateVideo = async (slug: string, userId: string, body: UpdateVideoBodySchema) => {
  await assertOwnsVideo(slug, userId);

  const category =
    body.categorySlug === undefined
      ? undefined
      : await prisma.category.findUnique({
          select: { id: true },
          where: { slug: body.categorySlug },
        });

  await prisma.video.update({
    data: {
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.durationSeconds !== undefined ? { durationSeconds: body.durationSeconds } : {}),
      ...(body.sourceUrl !== undefined ? { sourceUrl: body.sourceUrl } : {}),
      ...(body.thumbnailUrl !== undefined ? { thumbnailUrl: body.thumbnailUrl } : {}),
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.visibility !== undefined ? { visibility: body.visibility } : {}),
      ...(category !== undefined ? { categoryId: category?.id ?? null } : {}),
    },
    where: { slug },
  });

  if (body.tags) {
    const tags = await connectTags(body.tags);
    const video = await prisma.video.findUniqueOrThrow({
      select: { id: true },
      where: { slug },
    });
    await prisma.$transaction([
      prisma.videoTag.deleteMany({ where: { videoId: video.id } }),
      prisma.videoTag.createMany({
        data: tags.map(tag => ({ tagId: tag.id, videoId: video.id })),
      }),
    ]);
  }

  return getVideoBySlug(slug, userId);
};

export const deleteVideo = async (slug: string, userId: string) => {
  const video = await assertOwnsVideo(slug, userId);
  await prisma.video.delete({ where: { id: video.id } });
};
