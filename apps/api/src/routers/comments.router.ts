import { initServer } from "@ts-rest/express";

import { STATUS_CODES } from "@/shared/constants";
import { webContract } from "@/shared/api";

import { requireAuth } from "../middleware/auth";
import { commentService } from "../services";

const s = initServer();

export const commentsRouter = s.router(webContract.comments, {
  create: {
    handler: async ({ body, params, req }) => ({
      body: await commentService.createComment(params.slug, req.user!.id, body),
      status: STATUS_CODES.CREATED,
    }),
    middleware: [requireAuth],
  },

  list: async ({ params, query }) => ({
    body: await commentService.listComments(params.slug, query),
    status: STATUS_CODES.SUCCESS,
  }),

  remove: {
    handler: async ({ params, req }) => {
      await commentService.deleteComment(params.commentId, req.user!.id);
      return { body: { ok: true as const }, status: STATUS_CODES.SUCCESS };
    },
    middleware: [requireAuth],
  },

  update: {
    handler: async ({ body, params, req }) => ({
      body: await commentService.updateComment(params.commentId, req.user!.id, body),
      status: STATUS_CODES.SUCCESS,
    }),
    middleware: [requireAuth],
  },
});
