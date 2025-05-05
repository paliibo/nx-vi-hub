import type {
  AddPlaylistItemBodySchema,
  CreatePlaylistBodySchema,
  ListHistoryQuerySchema,
  ReorderPlaylistBodySchema,
  UpdatePlaylistBodySchema,
} from "@/shared/validation";

import { SYSTEM_PLAYLIST, SYSTEM_PLAYLIST_TITLES, SystemPlaylist } from "@/shared/constants";
import { BadRequestError, ForbiddenError, NotFoundError, getPaginatedResponse } from "@/shared/utils";
import { prisma } from "@nx-vi-hub/db/server";

import {
  playlistSelect,
  playlistSummarySelect,
  toPlaylist,
  toPlaylistSummary,
  toVideoSummary,
  toWatchHistoryEntry,
  videoSummarySelect,
} from "../mappers";
import { paginationQuerySchema } from "@/shared/utils/validation";
import { z } from "zod";

// --- playlists -------------------------------------------------------------

/**
 * The two built-in playlists are created on demand rather than at sign-up, so
 * accounts that existed before the feature get them the first time they open
 * their library.
 */
const ensureSystemPlaylist = async (ownerId: string, system: SystemPlaylist) => {
  const existing = await prisma.playlist.findUnique({
    select: { id: true },
    where: { ownerId_system: { ownerId, system } },
  });
  if (existing) return existing.id;

  const created = await prisma.playlist.create({
    data: { ownerId, system, title: SYSTEM_PLAYLIST_TITLES[system] },
    select: { id: true },
  });
  return created.id;
};

export const listPlaylists = async (ownerId: string) => {
  await Promise.all([
    ensureSystemPlaylist(ownerId, SYSTEM_PLAYLIST.WATCH_LATER),
    ensureSystemPlaylist(ownerId, SYSTEM_PLAYLIST.LIKED),
  ]);

  const rows = await prisma.playlist.findMany({
    // Built-in playlists pin to the top; the rest are most-recently-touched first.
    orderBy: [{ system: "asc" }, { updatedAt: "desc" }],
    select: playlistSummarySelect,
    where: { ownerId },
  });

  return { items: rows.map(toPlaylistSummary) };
};

const loadOwnedPlaylist = async (playlistId: string, ownerId: string) => {
  const playlist = await prisma.playlist.findUnique({
    select: { id: true, ownerId: true, system: true },
    where: { id: playlistId },
  });
  if (!playlist) throw new NotFoundError("Playlist");
  if (playlist.ownerId !== ownerId) throw new ForbiddenError("This playlist is not yours");
  return playlist;
};

const readPlaylist = async (playlistId: string) => {
  const playlist = await prisma.playlist.findUnique({
    select: playlistSelect,
    where: { id: playlistId },
  });
  if (!playlist) throw new NotFoundError("Playlist");
  return toPlaylist(playlist);
};

export const getPlaylist = async (playlistId: string, ownerId: string) => {
  await loadOwnedPlaylist(playlistId, ownerId);
  return readPlaylist(playlistId);
};

export const createPlaylist = async (ownerId: string, body: CreatePlaylistBodySchema) => {
  const playlist = await prisma.playlist.create({
    data: {
      description: body.description ?? null,
      ownerId,
      title: body.title.trim(),
      visibility: body.visibility,
    },
    select: { id: true },
  });
  return readPlaylist(playlist.id);
};

export const updatePlaylist = async (
  playlistId: string,
  ownerId: string,
  body: UpdatePlaylistBodySchema,
) => {
  const playlist = await loadOwnedPlaylist(playlistId, ownerId);
  if (playlist.system) throw new BadRequestError("Built-in playlists cannot be renamed");

  await prisma.playlist.update({
    data: {
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.title !== undefined ? { title: body.title.trim() } : {}),
      ...(body.visibility !== undefined ? { visibility: body.visibility } : {}),
    },
    where: { id: playlistId },
  });

  return readPlaylist(playlistId);
};

export const deletePlaylist = async (playlistId: string, ownerId: string) => {
  const playlist = await loadOwnedPlaylist(playlistId, ownerId);
  if (playlist.system) throw new BadRequestError("Built-in playlists cannot be deleted");
  await prisma.playlist.delete({ where: { id: playlistId } });
};

export const addPlaylistItem = async (
  playlistId: string,
  ownerId: string,
  body: AddPlaylistItemBodySchema,
) => {
  await loadOwnedPlaylist(playlistId, ownerId);

  const video = await prisma.video.findUnique({ select: { id: true }, where: { id: body.videoId } });
  if (!video) throw new NotFoundError("Video");

  const last = await prisma.playlistItem.findFirst({
    orderBy: { position: "desc" },
    select: { position: true },
    where: { playlistId },
  });

  await prisma.playlistItem.upsert({
    create: { playlistId, position: (last?.position ?? -1) + 1, videoId: video.id },
    // Re-adding an existing video is a no-op rather than an error: the button
    // that triggers it is not always able to know the video is already there.
    update: {},
    where: { playlistId_videoId: { playlistId, videoId: video.id } },
  });

  await prisma.playlist.update({ data: { updatedAt: new Date() }, where: { id: playlistId } });

  return readPlaylist(playlistId);
};

export const removePlaylistItem = async (playlistId: string, itemId: string, ownerId: string) => {
  await loadOwnedPlaylist(playlistId, ownerId);
  await prisma.playlistItem.deleteMany({ where: { id: itemId, playlistId } });
  return readPlaylist(playlistId);
};

export const reorderPlaylist = async (
  playlistId: string,
  ownerId: string,
  body: ReorderPlaylistBodySchema,
) => {
  await loadOwnedPlaylist(playlistId, ownerId);

  const items = await prisma.playlistItem.findMany({
    select: { id: true },
    where: { playlistId },
  });
  const known = new Set(items.map(item => item.id));

  // Reject a partial list outright. Applying it would silently drop the
  // positions of everything the client left out.
  if (body.itemIds.length !== items.length || body.itemIds.some(id => !known.has(id))) {
    throw new BadRequestError("The order must list every item in the playlist exactly once");
  }

  await prisma.$transaction([
    ...body.itemIds.map((id, position) =>
      prisma.playlistItem.update({ data: { position }, where: { id } }),
    ),
    prisma.playlist.update({ data: { updatedAt: new Date() }, where: { id: playlistId } }),
  ]);

  return readPlaylist(playlistId);
};

// --- history ---------------------------------------------------------------

export const listHistory = async (userId: string, query: ListHistoryQuerySchema) => {
  const where = { userId };

  const [rows, count] = await prisma.$transaction([
    prisma.watchHistory.findMany({
      orderBy: { watchedAt: "desc" },
      select: {
        completed: true,
        positionSeconds: true,
        video: { select: videoSummarySelect },
        watchedAt: true,
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      where,
    }),
    prisma.watchHistory.count({ where }),
  ]);

  return getPaginatedResponse(rows.map(toWatchHistoryEntry), {
    count,
    limit: query.limit,
    page: query.page,
  });
};

export const clearHistory = async (userId: string) => {
  await prisma.watchHistory.deleteMany({ where: { userId } });
};

export const removeHistoryEntry = async (userId: string, videoId: string) => {
  await prisma.watchHistory.deleteMany({ where: { userId, videoId } });
};

// --- subscriptions and likes ----------------------------------------------

export const listSubscriptions = async (userId: string) => {
  const rows = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      channel: {
        select: {
          _count: { select: { subscriptions: true } },
          accentColor: true,
          avatarUrl: true,
          handle: true,
          id: true,
          name: true,
          videos: {
            orderBy: { publishedAt: "desc" },
            select: videoSummarySelect,
            take: 1,
            where: { visibility: "PUBLIC" },
          },
        },
      },
    },
    where: { userId },
  });

  return {
    items: rows.map(({ channel }) => ({
      accentColor: channel.accentColor,
      avatarUrl: channel.avatarUrl,
      handle: channel.handle,
      id: channel.id,
      latestVideo: channel.videos[0] ? toVideoSummary(channel.videos[0]) : null,
      name: channel.name,
      subscriberCount: channel._count.subscriptions,
    })),
  };
};

export const listLiked = async (userId: string, query: z.infer<typeof paginationQuerySchema>) => {
  const where = { reactions: { some: { type: "LIKE" as const, userId } }, visibility: "PUBLIC" as const };

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
