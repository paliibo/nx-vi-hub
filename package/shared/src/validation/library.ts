import { z } from "zod";

import {
  channelSummarySchema,
  playlistSchema,
  playlistSummarySchema,
  videoIdSchema,
  videoSummarySchema,
  watchHistoryEntrySchema,
} from "../types/db";
import { visibilitySchema } from "../types/enums";
import { getPaginatedResponseValidation, paginationQuerySchema } from "../utils/validation";

// --- playlists -------------------------------------------------------------

export type ListPlaylistsResponseSchema = z.infer<typeof listPlaylistsResponseSchema>;
export const listPlaylistsResponseSchema = z.object({
  items: z.array(playlistSummarySchema),
});

export type PlaylistIdParamsSchema = z.infer<typeof playlistIdParamsSchema>;
export const playlistIdParamsSchema = z.object({ playlistId: z.string().uuid() });

export type PlaylistResponseSchema = z.infer<typeof playlistResponseSchema>;
export const playlistResponseSchema = playlistSchema;

export type CreatePlaylistBodySchema = z.infer<typeof createPlaylistBodySchema>;
export type CreatePlaylistInputSchema = z.input<typeof createPlaylistBodySchema>;
export const createPlaylistBodySchema = z.object({
  description: z.string().max(600).nullable().optional(),
  title: z.string().trim().min(1, "Name the playlist").max(80, "Keep the name under 80 characters"),
  visibility: visibilitySchema.default("PRIVATE"),
});

export type UpdatePlaylistBodySchema = z.infer<typeof updatePlaylistBodySchema>;
export const updatePlaylistBodySchema = createPlaylistBodySchema.partial();

export type AddPlaylistItemBodySchema = z.infer<typeof addPlaylistItemBodySchema>;
export const addPlaylistItemBodySchema = z.object({ videoId: videoIdSchema });

export type PlaylistItemParamsSchema = z.infer<typeof playlistItemParamsSchema>;
export const playlistItemParamsSchema = z.object({
  itemId: z.string().uuid(),
  playlistId: z.string().uuid(),
});

/**
 * Reordering sends the full ordered id list rather than a from/to pair. It is
 * one round trip, it is idempotent, and a dropped request cannot leave the
 * playlist half-reordered.
 */
export type ReorderPlaylistBodySchema = z.infer<typeof reorderPlaylistBodySchema>;
export const reorderPlaylistBodySchema = z.object({
  itemIds: z.array(z.string().uuid()).min(1, "Nothing to reorder"),
});

// --- history ---------------------------------------------------------------

export type ListHistoryQuerySchema = z.infer<typeof listHistoryQuerySchema>;
export const listHistoryQuerySchema = paginationQuerySchema;

export type ListHistoryResponseSchema = z.infer<typeof listHistoryResponseSchema>;
export const listHistoryResponseSchema = getPaginatedResponseValidation(watchHistoryEntrySchema);

export type RecordProgressBodySchema = z.infer<typeof recordProgressBodySchema>;
export const recordProgressBodySchema = z.object({
  positionSeconds: z.number().int().min(0),
});

export type RecordProgressResponseSchema = z.infer<typeof recordProgressResponseSchema>;
export const recordProgressResponseSchema = z.object({
  completed: z.boolean(),
  positionSeconds: z.number().int().min(0),
});

// --- subscriptions ---------------------------------------------------------

export type ListSubscriptionsResponseSchema = z.infer<typeof listSubscriptionsResponseSchema>;
export const listSubscriptionsResponseSchema = z.object({
  items: z.array(
    channelSummarySchema.extend({
      latestVideo: videoSummarySchema.nullable(),
      subscriberCount: z.number().int().min(0),
    }),
  ),
});

export type ListLikedResponseSchema = z.infer<typeof listLikedResponseSchema>;
export const listLikedResponseSchema = getPaginatedResponseValidation(videoSummarySchema);
