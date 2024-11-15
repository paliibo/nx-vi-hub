import { z } from "zod";

import { commentSchema, commentThreadSchema } from "../types/db";
import { getPaginatedResponseValidation, paginationQuerySchema } from "../utils/validation";

export type ListCommentsQuerySchema = z.infer<typeof listCommentsQuerySchema>;
export const listCommentsQuerySchema = paginationQuerySchema;

export type ListCommentsResponseSchema = z.infer<typeof listCommentsResponseSchema>;
export const listCommentsResponseSchema = getPaginatedResponseValidation(commentThreadSchema);

export type CreateCommentBodySchema = z.infer<typeof createCommentBodySchema>;
export const createCommentBodySchema = z.object({
  body: z.string().trim().min(1, "Say something first").max(1000, "Keep it under 1000 characters"),
  /** Set to reply to an existing top-level comment. Replies cannot be nested further. */
  parentId: z.string().uuid().nullable().optional(),
});

export type UpdateCommentBodySchema = z.infer<typeof updateCommentBodySchema>;
export const updateCommentBodySchema = z.object({
  body: z.string().trim().min(1, "Say something first").max(1000, "Keep it under 1000 characters"),
});

export type CommentIdParamsSchema = z.infer<typeof commentIdParamsSchema>;
export const commentIdParamsSchema = z.object({ commentId: z.string().uuid() });

export type CommentResponseSchema = z.infer<typeof commentResponseSchema>;
export const commentResponseSchema = commentSchema;
