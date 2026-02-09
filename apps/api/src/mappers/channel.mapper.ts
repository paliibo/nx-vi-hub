import { Prisma } from "@nx-vi-hub/db/server";

import type { ChannelSchema, PublicUserSchema, SessionUserSchema } from "@/shared/types/db";

export const channelSelect = {
  _count: { select: { subscriptions: true, videos: true } },
  accentColor: true,
  avatarUrl: true,
  bannerUrl: true,
  createdAt: true,
  description: true,
  handle: true,
  id: true,
  name: true,
} satisfies Prisma.ChannelSelect;

export type ChannelRow = Prisma.ChannelGetPayload<{ select: typeof channelSelect }>;

export const toChannel = (
  row: ChannelRow,
  extra: { isSubscribed: boolean | null; totalViews: number },
): ChannelSchema => ({
  accentColor: row.accentColor,
  avatarUrl: row.avatarUrl,
  bannerUrl: row.bannerUrl,
  createdAt: row.createdAt,
  description: row.description,
  handle: row.handle,
  id: row.id,
  isSubscribed: extra.isSubscribed,
  name: row.name,
  subscriberCount: row._count.subscriptions,
  totalViews: extra.totalViews,
  videoCount: row._count.videos,
});

export const publicUserSelect = {
  avatarUrl: true,
  bio: true,
  createdAt: true,
  displayName: true,
  id: true,
  username: true,
} satisfies Prisma.UserSelect;

export type PublicUserRow = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

export const toPublicUser = (row: PublicUserRow): PublicUserSchema => row;

export const sessionUserSelect = {
  ...publicUserSelect,
  channel: {
    select: { accentColor: true, avatarUrl: true, handle: true, id: true, name: true },
  },
  email: true,
  role: true,
} satisfies Prisma.UserSelect;

export type SessionUserRow = Prisma.UserGetPayload<{ select: typeof sessionUserSelect }>;

export const toSessionUser = (row: SessionUserRow): SessionUserSchema => ({
  avatarUrl: row.avatarUrl,
  bio: row.bio,
  channel: row.channel,
  createdAt: row.createdAt,
  displayName: row.displayName,
  email: row.email,
  id: row.id,
  role: row.role,
  username: row.username,
});
