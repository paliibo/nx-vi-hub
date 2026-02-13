import { z } from "zod";

import { STATUS_CODES } from "../constants";
import { ContractInstance } from "../types/general";
import { paginationQuerySchema } from "../utils/validation";
import {
  addPlaylistItemBodySchema,
  createPlaylistBodySchema,
  listHistoryQuerySchema,
  listHistoryResponseSchema,
  listLikedResponseSchema,
  listPlaylistsResponseSchema,
  listSubscriptionsResponseSchema,
  playlistIdParamsSchema,
  playlistItemParamsSchema,
  playlistResponseSchema,
  reorderPlaylistBodySchema,
  updatePlaylistBodySchema,
} from "../validation";
import { authErrors, authLookupErrors, conflictErrors } from "./responses";

const ok = z.object({ ok: z.literal(true) });

/** Everything under here requires a session; there is no anonymous library. */
export const libraryContract = (c: ContractInstance) =>
  c.router(
    {
      addPlaylistItem: {
        body: addPlaylistItemBodySchema,
        method: "POST",
        path: "/playlists/:playlistId/items",
        pathParams: playlistIdParamsSchema,
        responses: {
          ...authLookupErrors,
          ...conflictErrors,
          [STATUS_CODES.CREATED]: playlistResponseSchema,
        },
        summary: "Append a video to a playlist",
      },
      clearHistory: {
        body: null,
        method: "DELETE",
        path: "/history",
        responses: {
          ...authErrors,
          [STATUS_CODES.SUCCESS]: ok,
        },
        summary: "Erase the current user's watch history",
      },
      createPlaylist: {
        body: createPlaylistBodySchema,
        method: "POST",
        path: "/playlists",
        responses: {
          ...authErrors,
          [STATUS_CODES.CREATED]: playlistResponseSchema,
        },
        summary: "Create a playlist",
      },
      deletePlaylist: {
        body: null,
        method: "DELETE",
        path: "/playlists/:playlistId",
        pathParams: playlistIdParamsSchema,
        responses: {
          ...authLookupErrors,
          [STATUS_CODES.SUCCESS]: ok,
        },
        summary: "Delete a playlist (the two built-in ones cannot be deleted)",
      },
      getPlaylist: {
        method: "GET",
        path: "/playlists/:playlistId",
        pathParams: playlistIdParamsSchema,
        responses: {
          ...authLookupErrors,
          [STATUS_CODES.SUCCESS]: playlistResponseSchema,
        },
        summary: "Read a playlist with its items in order",
      },
      liked: {
        method: "GET",
        path: "/liked",
        query: paginationQuerySchema,
        responses: {
          ...authErrors,
          [STATUS_CODES.SUCCESS]: listLikedResponseSchema,
        },
        summary: "Videos the current user has liked",
      },
      listPlaylists: {
        method: "GET",
        path: "/playlists",
        responses: {
          ...authErrors,
          [STATUS_CODES.SUCCESS]: listPlaylistsResponseSchema,
        },
        summary: "List the current user's playlists",
      },
      removeHistoryEntry: {
        body: null,
        method: "DELETE",
        path: "/history/:videoId",
        pathParams: z.object({ videoId: z.string().uuid() }),
        responses: {
          ...authLookupErrors,
          [STATUS_CODES.SUCCESS]: ok,
        },
        summary: "Remove a single video from the watch history",
      },
      removePlaylistItem: {
        body: null,
        method: "DELETE",
        path: "/playlists/:playlistId/items/:itemId",
        pathParams: playlistItemParamsSchema,
        responses: {
          ...authLookupErrors,
          [STATUS_CODES.SUCCESS]: playlistResponseSchema,
        },
        summary: "Remove one item from a playlist",
      },
      reorderPlaylist: {
        body: reorderPlaylistBodySchema,
        method: "PUT",
        path: "/playlists/:playlistId/order",
        pathParams: playlistIdParamsSchema,
        responses: {
          ...authLookupErrors,
          [STATUS_CODES.SUCCESS]: playlistResponseSchema,
        },
        summary: "Replace a playlist's item order",
      },
      subscriptions: {
        method: "GET",
        path: "/subscriptions",
        responses: {
          ...authErrors,
          [STATUS_CODES.SUCCESS]: listSubscriptionsResponseSchema,
        },
        summary: "Channels the current user follows, newest upload first",
      },
      updatePlaylist: {
        body: updatePlaylistBodySchema,
        method: "PATCH",
        path: "/playlists/:playlistId",
        pathParams: playlistIdParamsSchema,
        responses: {
          ...authLookupErrors,
          [STATUS_CODES.SUCCESS]: playlistResponseSchema,
        },
        summary: "Rename a playlist or change its visibility",
      },
      watchHistory: {
        method: "GET",
        path: "/history",
        query: listHistoryQuerySchema,
        responses: {
          ...authErrors,
          [STATUS_CODES.SUCCESS]: listHistoryResponseSchema,
        },
        summary: "Page through the current user's watch history",
      },
    },
    { pathPrefix: "/library" },
  );
