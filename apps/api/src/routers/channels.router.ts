import { initServer } from "@ts-rest/express";

import { webContract } from "@/shared/api";
import { STATUS_CODES } from "@/shared/constants";

import { currentUser, requireAuth } from "../middleware/auth";
import { channelService } from "../services";

const s = initServer();

export const channelsRouter = s.router(webContract.channels, {
  create: {
    handler: async ({ body, req }) => ({
      body: await channelService.createChannel(currentUser(req).id, body),
      status: STATUS_CODES.CREATED,
    }),
    middleware: [requireAuth],
  },

  getByHandle: async ({ params, req }) => ({
    body: await channelService.getChannelByHandle(params.handle, req.user?.id),
    status: STATUS_CODES.SUCCESS,
  }),

  listVideos: async ({ params, query }) => ({
    body: await channelService.listChannelVideos(params.handle, query),
    status: STATUS_CODES.SUCCESS,
  }),

  subscribe: {
    handler: async ({ params, req }) => ({
      body: await channelService.subscribe(params.handle, currentUser(req).id),
      status: STATUS_CODES.SUCCESS,
    }),
    middleware: [requireAuth],
  },

  unsubscribe: {
    handler: async ({ params, req }) => ({
      body: await channelService.unsubscribe(params.handle, currentUser(req).id),
      status: STATUS_CODES.SUCCESS,
    }),
    middleware: [requireAuth],
  },

  update: {
    handler: async ({ body, params, req }) => ({
      body: await channelService.updateChannel(params.handle, currentUser(req).id, body),
      status: STATUS_CODES.SUCCESS,
    }),
    middleware: [requireAuth],
  },
});
