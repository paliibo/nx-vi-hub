import { initServer } from "@ts-rest/express";

import { STATUS_CODES } from "@/shared/constants";
import { webContract } from "@/shared/api";

import { requireAuth } from "../middleware/auth";
import { libraryService } from "../services";

const s = initServer();

/**
 * Every route here is behind requireAuth — a library belongs to exactly one
 * account, and there is no anonymous equivalent.
 */
export const libraryRouter = s.router(webContract.library, {
  addPlaylistItem: {
    handler: async ({ body, params, req }) => ({
      body: await libraryService.addPlaylistItem(params.playlistId, req.user!.id, body),
      status: STATUS_CODES.CREATED,
    }),
    middleware: [requireAuth],
  },

  clearHistory: {
    handler: async ({ req }) => {
      await libraryService.clearHistory(req.user!.id);
      return { body: { ok: true as const }, status: STATUS_CODES.SUCCESS };
    },
    middleware: [requireAuth],
  },

  createPlaylist: {
    handler: async ({ body, req }) => ({
      body: await libraryService.createPlaylist(req.user!.id, body),
      status: STATUS_CODES.CREATED,
    }),
    middleware: [requireAuth],
  },

  deletePlaylist: {
    handler: async ({ params, req }) => {
      await libraryService.deletePlaylist(params.playlistId, req.user!.id);
      return { body: { ok: true as const }, status: STATUS_CODES.SUCCESS };
    },
    middleware: [requireAuth],
  },

  getPlaylist: {
    handler: async ({ params, req }) => ({
      body: await libraryService.getPlaylist(params.playlistId, req.user!.id),
      status: STATUS_CODES.SUCCESS,
    }),
    middleware: [requireAuth],
  },

  liked: {
    handler: async ({ query, req }) => ({
      body: await libraryService.listLiked(req.user!.id, query),
      status: STATUS_CODES.SUCCESS,
    }),
    middleware: [requireAuth],
  },

  listPlaylists: {
    handler: async ({ req }) => ({
      body: await libraryService.listPlaylists(req.user!.id),
      status: STATUS_CODES.SUCCESS,
    }),
    middleware: [requireAuth],
  },

  removeHistoryEntry: {
    handler: async ({ params, req }) => {
      await libraryService.removeHistoryEntry(req.user!.id, params.videoId);
      return { body: { ok: true as const }, status: STATUS_CODES.SUCCESS };
    },
    middleware: [requireAuth],
  },

  removePlaylistItem: {
    handler: async ({ params, req }) => ({
      body: await libraryService.removePlaylistItem(
        params.playlistId,
        params.itemId,
        req.user!.id,
      ),
      status: STATUS_CODES.SUCCESS,
    }),
    middleware: [requireAuth],
  },

  reorderPlaylist: {
    handler: async ({ body, params, req }) => ({
      body: await libraryService.reorderPlaylist(params.playlistId, req.user!.id, body),
      status: STATUS_CODES.SUCCESS,
    }),
    middleware: [requireAuth],
  },

  subscriptions: {
    handler: async ({ req }) => ({
      body: await libraryService.listSubscriptions(req.user!.id),
      status: STATUS_CODES.SUCCESS,
    }),
    middleware: [requireAuth],
  },

  updatePlaylist: {
    handler: async ({ body, params, req }) => ({
      body: await libraryService.updatePlaylist(params.playlistId, req.user!.id, body),
      status: STATUS_CODES.SUCCESS,
    }),
    middleware: [requireAuth],
  },

  watchHistory: {
    handler: async ({ query, req }) => ({
      body: await libraryService.listHistory(req.user!.id, query),
      status: STATUS_CODES.SUCCESS,
    }),
    middleware: [requireAuth],
  },
});
