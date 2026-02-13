import { initServer } from "@ts-rest/express";

import { webContract } from "@/shared/api";
import { STATUS_CODES } from "@/shared/constants";

import { currentUser, requireAuth } from "../middleware/auth";
import { videoService } from "../services";

const s = initServer();

export const videosRouter = s.router(webContract.videos, {
  create: {
    handler: async ({ body, req }) => ({
      body: await videoService.createVideo(currentUser(req).id, body),
      status: STATUS_CODES.CREATED,
    }),
    middleware: [requireAuth],
  },

  getBySlug: async ({ params, req }) => ({
    body: await videoService.getVideoBySlug(params.slug, req.user?.id),
    status: STATUS_CODES.SUCCESS,
  }),

  list: async ({ query }) => ({
    body: await videoService.listVideos(query),
    status: STATUS_CODES.SUCCESS,
  }),

  react: {
    handler: async ({ body, params, req }) => ({
      body: await videoService.reactToVideo(params.slug, currentUser(req).id, body),
      status: STATUS_CODES.SUCCESS,
    }),
    middleware: [requireAuth],
  },

  recordProgress: {
    handler: async ({ body, params, req }) => ({
      body: await videoService.recordProgress(params.slug, currentUser(req).id, body),
      status: STATUS_CODES.SUCCESS,
    }),
    middleware: [requireAuth],
  },

  registerView: async ({ params }) => ({
    body: await videoService.registerView(params.slug),
    status: STATUS_CODES.SUCCESS,
  }),

  related: async ({ params }) => ({
    body: await videoService.getRelatedVideos(params.slug),
    status: STATUS_CODES.SUCCESS,
  }),

  remove: {
    handler: async ({ params, req }) => {
      await videoService.deleteVideo(params.slug, currentUser(req).id);
      return { body: { ok: true as const }, status: STATUS_CODES.SUCCESS };
    },
    middleware: [requireAuth],
  },

  update: {
    handler: async ({ body, params, req }) => ({
      body: await videoService.updateVideo(params.slug, currentUser(req).id, body),
      status: STATUS_CODES.SUCCESS,
    }),
    middleware: [requireAuth],
  },
});
