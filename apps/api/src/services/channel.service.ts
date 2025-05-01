import type {
  CreateChannelBodySchema,
  ListChannelVideosQuerySchema,
  UpdateChannelBodySchema,
} from "@/shared/validation";

import { ConflictError, ForbiddenError, NotFoundError, getPaginatedResponse } from "@/shared/utils";
import { prisma } from "@nx-vi-hub/db/server";

import { channelSelect, toChannel, toVideoSummary, videoSummarySelect } from "../mappers";

const loadChannel = async (handle: string) => {
  const channel = await prisma.channel.findUnique({ select: channelSelect, where: { handle } });
  if (!channel) throw new NotFoundError("Channel");
  return channel;
};

/** Sum of views across a channel's public videos, aggregated in Postgres. */
const totalViewsFor = async (channelId: string) => {
  const result = await prisma.video.aggregate({
    _sum: { views: true },
    where: { channelId, visibility: "PUBLIC" },
  });
  return result._sum.views ?? 0;
};

export const getChannelByHandle = async (handle: string, viewerId?: string) => {
  const channel = await loadChannel(handle);

  const [totalViews, subscription] = await Promise.all([
    totalViewsFor(channel.id),
    viewerId
      ? prisma.subscription.findUnique({
          select: { userId: true },
          where: { userId_channelId: { channelId: channel.id, userId: viewerId } },
        })
      : null,
  ]);

  return toChannel(channel, {
    isSubscribed: viewerId ? Boolean(subscription) : null,
    totalViews,
  });
};

export const listChannelVideos = async (handle: string, query: ListChannelVideosQuerySchema) => {
  const channel = await prisma.channel.findUnique({ select: { id: true }, where: { handle } });
  if (!channel) throw new NotFoundError("Channel");

  const where = { channelId: channel.id, visibility: "PUBLIC" as const };

  const [rows, count] = await prisma.$transaction([
    prisma.video.findMany({
      orderBy: { publishedAt: "desc" },
      select: videoSummarySelect,
      skip: (query.page - 1) * query.limit,
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

export const subscribe = async (handle: string, userId: string) => {
  const channel = await prisma.channel.findUnique({
    select: { id: true, ownerId: true },
    where: { handle },
  });
  if (!channel) throw new NotFoundError("Channel");
  if (channel.ownerId === userId) {
    throw new ForbiddenError("You cannot subscribe to your own channel");
  }

  await prisma.subscription.upsert({
    create: { channelId: channel.id, userId },
    update: {},
    where: { userId_channelId: { channelId: channel.id, userId } },
  });

  return {
    isSubscribed: true,
    subscriberCount: await prisma.subscription.count({ where: { channelId: channel.id } }),
  };
};

export const unsubscribe = async (handle: string, userId: string) => {
  const channel = await prisma.channel.findUnique({ select: { id: true }, where: { handle } });
  if (!channel) throw new NotFoundError("Channel");

  await prisma.subscription.deleteMany({ where: { channelId: channel.id, userId } });

  return {
    isSubscribed: false,
    subscriberCount: await prisma.subscription.count({ where: { channelId: channel.id } }),
  };
};

export const createChannel = async (userId: string, body: CreateChannelBodySchema) => {
  const [existingOwn, handleTaken] = await Promise.all([
    prisma.channel.findUnique({ select: { id: true }, where: { ownerId: userId } }),
    prisma.channel.findUnique({ select: { id: true }, where: { handle: body.handle } }),
  ]);

  if (existingOwn) throw new ConflictError("You already have a channel");
  if (handleTaken) throw new ConflictError("That handle is taken");

  const channel = await prisma.channel.create({
    data: {
      accentColor: body.accentColor ?? "#a3e635",
      description: body.description ?? null,
      handle: body.handle,
      name: body.name,
      ownerId: userId,
    },
    select: { handle: true },
  });

  return getChannelByHandle(channel.handle, userId);
};

export const updateChannel = async (
  handle: string,
  userId: string,
  body: UpdateChannelBodySchema,
) => {
  const channel = await prisma.channel.findUnique({
    select: { id: true, ownerId: true },
    where: { handle },
  });
  if (!channel) throw new NotFoundError("Channel");
  if (channel.ownerId !== userId) throw new ForbiddenError("This channel is not yours");

  if (body.handle && body.handle !== handle) {
    const taken = await prisma.channel.findUnique({
      select: { id: true },
      where: { handle: body.handle },
    });
    if (taken) throw new ConflictError("That handle is taken");
  }

  const updated = await prisma.channel.update({
    data: {
      ...(body.accentColor !== undefined ? { accentColor: body.accentColor } : {}),
      ...(body.avatarUrl !== undefined ? { avatarUrl: body.avatarUrl } : {}),
      ...(body.bannerUrl !== undefined ? { bannerUrl: body.bannerUrl } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.handle !== undefined ? { handle: body.handle } : {}),
      ...(body.name !== undefined ? { name: body.name } : {}),
    },
    select: { handle: true },
    where: { id: channel.id },
  });

  return getChannelByHandle(updated.handle, userId);
};
