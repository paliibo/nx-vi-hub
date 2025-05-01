import type {
  CreateCommentBodySchema,
  ListCommentsQuerySchema,
  UpdateCommentBodySchema,
} from "@/shared/validation";

import { BadRequestError, ForbiddenError, NotFoundError, getPaginatedResponse } from "@/shared/utils";
import { prisma } from "@nx-vi-hub/db/server";

import { commentSelect, threadSelect, toComment, toCommentThread } from "../mappers";

const resolveVideoId = async (slug: string) => {
  const video = await prisma.video.findUnique({ select: { id: true }, where: { slug } });
  if (!video) throw new NotFoundError("Video");
  return video.id;
};

export const listComments = async (slug: string, query: ListCommentsQuerySchema) => {
  const videoId = await resolveVideoId(slug);
  // Only top-level comments are paged; replies ride along with their parent.
  const where = { parentId: null, videoId };

  const [rows, count] = await prisma.$transaction([
    prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      select: threadSelect,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      where,
    }),
    prisma.comment.count({ where }),
  ]);

  return getPaginatedResponse(rows.map(toCommentThread), {
    count,
    limit: query.limit,
    page: query.page,
  });
};

export const createComment = async (
  slug: string,
  authorId: string,
  body: CreateCommentBodySchema,
) => {
  const videoId = await resolveVideoId(slug);

  if (body.parentId) {
    const parent = await prisma.comment.findUnique({
      select: { parentId: true, videoId: true },
      where: { id: body.parentId },
    });

    if (!parent || parent.videoId !== videoId) {
      throw new NotFoundError("The comment you are replying to");
    }
    // One level only. Threads deeper than this are unreadable on a phone and
    // the schema deliberately does not support rendering them.
    if (parent.parentId) {
      throw new BadRequestError("Replies cannot be nested any deeper");
    }
  }

  const comment = await prisma.comment.create({
    data: {
      authorId,
      body: body.body.trim(),
      parentId: body.parentId ?? null,
      videoId,
    },
    select: commentSelect,
  });

  return toComment(comment);
};

const assertOwnComment = async (commentId: string, userId: string) => {
  const comment = await prisma.comment.findUnique({
    select: { authorId: true, id: true },
    where: { id: commentId },
  });
  if (!comment) throw new NotFoundError("Comment");
  if (comment.authorId !== userId) throw new ForbiddenError("This comment is not yours");
  return comment;
};

export const updateComment = async (
  commentId: string,
  userId: string,
  body: UpdateCommentBodySchema,
) => {
  await assertOwnComment(commentId, userId);

  const comment = await prisma.comment.update({
    data: { body: body.body.trim() },
    select: commentSelect,
    where: { id: commentId },
  });

  return toComment(comment);
};

export const deleteComment = async (commentId: string, userId: string) => {
  await assertOwnComment(commentId, userId);
  // Replies cascade via the schema's onDelete, so deleting a thread root does
  // not leave orphaned children pointing at a missing parent.
  await prisma.comment.delete({ where: { id: commentId } });
};
