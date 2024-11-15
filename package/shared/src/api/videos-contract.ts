import { z } from "zod";

import { STATUS_CODES } from "../constants";
import { ContractInstance } from "../types/general";
import {
  createVideoBodySchema,
  listVideosQuerySchema,
  listVideosResponseSchema,
  reactBodySchema,
  reactResponseSchema,
  recordProgressBodySchema,
  recordProgressResponseSchema,
  relatedVideosResponseSchema,
  updateVideoBodySchema,
  videoDetailResponseSchema,
  videoSlugParamsSchema,
  viewResponseSchema,
} from "../validation";
import { authLookupErrors, commonErrors, conflictErrors, lookupErrors } from "./responses";

/**
 * Note that discovery lives in `catalogContract`, not here. A route such as
 * `/videos/discover` would be shadowed the day somebody publishes a video whose
 * slug is "discover", so the two namespaces are kept apart.
 */
export const videosContract = (c: ContractInstance) =>
  c.router(
    {
      create: {
        body: createVideoBodySchema,
        method: "POST",
        path: "",
        responses: {
          ...conflictErrors,
          ...authLookupErrors,
          [STATUS_CODES.CREATED]: videoDetailResponseSchema,
        },
        summary: "Publish a video to the current user's channel",
      },
      getBySlug: {
        method: "GET",
        path: "/:slug",
        pathParams: videoSlugParamsSchema,
        responses: {
          ...lookupErrors,
          [STATUS_CODES.SUCCESS]: videoDetailResponseSchema,
        },
        summary: "Read one video with viewer-specific state resolved",
      },
      list: {
        method: "GET",
        path: "",
        query: listVideosQuerySchema,
        responses: {
          ...commonErrors,
          [STATUS_CODES.SUCCESS]: listVideosResponseSchema,
        },
        summary: "Search and filter the catalog",
      },
      react: {
        body: reactBodySchema,
        method: "PUT",
        path: "/:slug/reaction",
        pathParams: videoSlugParamsSchema,
        responses: {
          ...authLookupErrors,
          [STATUS_CODES.SUCCESS]: reactResponseSchema,
        },
        summary: "Like, dislike, or clear a reaction",
      },
      recordProgress: {
        body: recordProgressBodySchema,
        method: "PUT",
        path: "/:slug/progress",
        pathParams: videoSlugParamsSchema,
        responses: {
          ...authLookupErrors,
          [STATUS_CODES.SUCCESS]: recordProgressResponseSchema,
        },
        summary: "Save the viewer's resume position",
      },
      registerView: {
        body: z.object({}).optional(),
        method: "POST",
        path: "/:slug/views",
        pathParams: videoSlugParamsSchema,
        responses: {
          ...lookupErrors,
          [STATUS_CODES.SUCCESS]: viewResponseSchema,
        },
        summary: "Count a view once the viewer has actually watched some of it",
      },
      related: {
        method: "GET",
        path: "/:slug/related",
        pathParams: videoSlugParamsSchema,
        responses: {
          ...lookupErrors,
          [STATUS_CODES.SUCCESS]: relatedVideosResponseSchema,
        },
        summary: "Videos sharing a category or tags with this one",
      },
      remove: {
        body: null,
        method: "DELETE",
        path: "/:slug",
        pathParams: videoSlugParamsSchema,
        responses: {
          ...authLookupErrors,
          [STATUS_CODES.SUCCESS]: z.object({ ok: z.literal(true) }),
        },
        summary: "Delete a video owned by the current user",
      },
      update: {
        body: updateVideoBodySchema,
        method: "PATCH",
        path: "/:slug",
        pathParams: videoSlugParamsSchema,
        responses: {
          ...authLookupErrors,
          [STATUS_CODES.SUCCESS]: videoDetailResponseSchema,
        },
        summary: "Edit a video owned by the current user",
      },
    },
    { pathPrefix: "/videos" },
  );
