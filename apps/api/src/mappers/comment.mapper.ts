import { Prisma } from "@nx-vi-hub/db/server";

import type { CommentSchema, CommentThreadSchema } from "@/shared/types/db";

import { publicUserSelect } from "./channel.mapper";

export const commentSelect = {
  author: { select: publicUserSelect },
  body: true,
  createdAt: true,
  id: true,
  parentId: true,
  updatedAt: true,
} satisfies Prisma.CommentSelect;

export type CommentRow = Prisma.CommentGetPayload<{ select: typeof commentSelect }>;

/**
 * `edited` is derived rather than stored. Prisma's @updatedAt is set on create
 * as well, so equal timestamps mean untouched — compared with a second of slack
 * because the two values are written by separate statements.
 */
const wasEdited = (createdAt: Date, updatedAt: Date) =>
  updatedAt.getTime() - createdAt.getTime() > 1000;

export const toComment = (row: CommentRow, replyCount = 0): CommentSchema => ({
  author: row.author,
  body: row.body,
  createdAt: row.createdAt,
  edited: wasEdited(row.createdAt, row.updatedAt),
  id: row.id,
  parentId: row.parentId,
  replyCount,
});

export const threadSelect = {
  ...commentSelect,
  _count: { select: { replies: true } },
  replies: {
    orderBy: { createdAt: "asc" as const },
    select: commentSelect,
    take: 3,
  },
} satisfies Prisma.CommentSelect;

export type CommentThreadRow = Prisma.CommentGetPayload<{ select: typeof threadSelect }>;

export const toCommentThread = (row: CommentThreadRow): CommentThreadSchema => ({
  ...toComment(row, row._count.replies),
  replies: row.replies.map(reply => toComment(reply)),
});
