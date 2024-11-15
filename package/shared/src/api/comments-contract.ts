import { z } from "zod";

import { STATUS_CODES } from "../constants";
import { ContractInstance } from "../types/general";
import {
  commentIdParamsSchema,
  commentResponseSchema,
  createCommentBodySchema,
  listCommentsQuerySchema,
  listCommentsResponseSchema,
  updateCommentBodySchema,
  videoSlugParamsSchema,
} from "../validation";
import { authLookupErrors, lookupErrors } from "./responses";

/**
 * Comments hang off `/videos/:slug` rather than living at a top level, because
 * a comment has no meaning apart from the video it is on.
 */
export const commentsContract = (c: ContractInstance) =>
  c.router(
    {
      create: {
        body: createCommentBodySchema,
        method: "POST",
        path: "/:slug/comments",
        pathParams: videoSlugParamsSchema,
        responses: {
          ...authLookupErrors,
          [STATUS_CODES.CREATED]: commentResponseSchema,
        },
        summary: "Post a comment or a reply",
      },
      list: {
        method: "GET",
        path: "/:slug/comments",
        pathParams: videoSlugParamsSchema,
        query: listCommentsQuerySchema,
        responses: {
          ...lookupErrors,
          [STATUS_CODES.SUCCESS]: listCommentsResponseSchema,
        },
        summary: "Page through a video's comment threads",
      },
      remove: {
        body: null,
        method: "DELETE",
        path: "/comments/:commentId",
        pathParams: commentIdParamsSchema,
        responses: {
          ...authLookupErrors,
          [STATUS_CODES.SUCCESS]: z.object({ ok: z.literal(true) }),
        },
        summary: "Delete your own comment",
      },
      update: {
        body: updateCommentBodySchema,
        method: "PATCH",
        path: "/comments/:commentId",
        pathParams: commentIdParamsSchema,
        responses: {
          ...authLookupErrors,
          [STATUS_CODES.SUCCESS]: commentResponseSchema,
        },
        summary: "Edit your own comment",
      },
    },
    { pathPrefix: "/videos" },
  );
