import { z } from "zod";

import { STATUS_CODES } from "../constants";
import { ContractInstance } from "../types/general";
import {
  channelHandleParamsSchema,
  channelResponseSchema,
  createChannelBodySchema,
  listChannelVideosQuerySchema,
  listChannelVideosResponseSchema,
  subscribeResponseSchema,
  updateChannelBodySchema,
} from "../validation";
import { authErrors, authLookupErrors, conflictErrors, lookupErrors } from "./responses";

export const channelsContract = (c: ContractInstance) =>
  c.router(
    {
      create: {
        body: createChannelBodySchema,
        method: "POST",
        path: "",
        responses: {
          ...authErrors,
          ...conflictErrors,
          [STATUS_CODES.CREATED]: channelResponseSchema,
        },
        summary: "Create the current user's channel",
      },
      getByHandle: {
        method: "GET",
        path: "/:handle",
        pathParams: channelHandleParamsSchema,
        responses: {
          ...lookupErrors,
          [STATUS_CODES.SUCCESS]: channelResponseSchema,
        },
        summary: "Read a channel with counts and viewer subscription state",
      },
      listVideos: {
        method: "GET",
        path: "/:handle/videos",
        pathParams: channelHandleParamsSchema,
        query: listChannelVideosQuerySchema,
        responses: {
          ...lookupErrors,
          [STATUS_CODES.SUCCESS]: listChannelVideosResponseSchema,
        },
        summary: "Page through a channel's public videos",
      },
      subscribe: {
        body: z.object({}).optional(),
        method: "POST",
        path: "/:handle/subscribe",
        pathParams: channelHandleParamsSchema,
        responses: {
          ...authLookupErrors,
          [STATUS_CODES.SUCCESS]: subscribeResponseSchema,
        },
        summary: "Subscribe to a channel",
      },
      unsubscribe: {
        body: null,
        method: "DELETE",
        path: "/:handle/subscribe",
        pathParams: channelHandleParamsSchema,
        responses: {
          ...authLookupErrors,
          [STATUS_CODES.SUCCESS]: subscribeResponseSchema,
        },
        summary: "Unsubscribe from a channel",
      },
      update: {
        body: updateChannelBodySchema,
        method: "PATCH",
        path: "/:handle",
        pathParams: channelHandleParamsSchema,
        responses: {
          ...authLookupErrors,
          ...conflictErrors,
          [STATUS_CODES.SUCCESS]: channelResponseSchema,
        },
        summary: "Edit a channel owned by the current user",
      },
    },
    { pathPrefix: "/channels" },
  );
