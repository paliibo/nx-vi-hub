import { z } from "zod";

import { reactionTypeSchema, roleSchema, visibilitySchema } from "./enums";

// --- primitives ------------------------------------------------------------

export type UserIdSchema = z.infer<typeof userIdSchema>;
export const userIdSchema = z.string().uuid();

export type VideoIdSchema = z.infer<typeof videoIdSchema>;
export const videoIdSchema = z.string().uuid();

export const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Must be lowercase words separated by single hyphens");

/** Channel handles read as `@name` in the UI but are stored without the sigil. */
export const handleSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-z0-9_]+$/, "Handle may only contain lowercase letters, numbers and underscores");

export const userPasswordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128, "That is longer than 128 characters");

export type TokensSchema = z.infer<typeof tokensSchema>;
export const tokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

// --- users -----------------------------------------------------------------

/** What any visitor may see about an account. Never carries email or role. */
export type PublicUserSchema = z.infer<typeof publicUserSchema>;
export const publicUserSchema = z.object({
  avatarUrl: z.string().nullable(),
  bio: z.string().nullable(),
  createdAt: z.coerce.date(),
  displayName: z.string(),
  id: userIdSchema,
  username: z.string(),
});

// --- channels --------------------------------------------------------------

/** The compact channel shape embedded in every video card. */
export type ChannelSummarySchema = z.infer<typeof channelSummarySchema>;
export const channelSummarySchema = z.object({
  accentColor: z.string(),
  avatarUrl: z.string().nullable(),
  handle: z.string(),
  id: z.string().uuid(),
  name: z.string(),
});

export type ChannelSchema = z.infer<typeof channelSchema>;
export const channelSchema = channelSummarySchema.extend({
  bannerUrl: z.string().nullable(),
  createdAt: z.coerce.date(),
  description: z.string().nullable(),
  /** Null for anonymous visitors, so the UI can tell "not subscribed" from "unknown". */
  isSubscribed: z.boolean().nullable(),
  subscriberCount: z.number().int().min(0),
  totalViews: z.number().int().min(0),
  videoCount: z.number().int().min(0),
});

// --- taxonomy --------------------------------------------------------------

export type CategorySchema = z.infer<typeof categorySchema>;
export const categorySchema = z.object({
  accentColor: z.string(),
  description: z.string().nullable(),
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  videoCount: z.number().int().min(0).optional(),
});

export type TagSchema = z.infer<typeof tagSchema>;
export const tagSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
});

// --- videos ----------------------------------------------------------------

/** The shape rendered by a video card in every grid and shelf. */
export type VideoSummarySchema = z.infer<typeof videoSummarySchema>;
export const videoSummarySchema = z.object({
  category: categorySchema.nullable(),
  channel: channelSummarySchema,
  durationSeconds: z.number().int().min(0),
  id: videoIdSchema,
  likeCount: z.number().int().min(0),
  publishedAt: z.coerce.date(),
  slug: z.string(),
  thumbnailUrl: z.string().nullable(),
  title: z.string(),
  views: z.number().int().min(0),
});

export type VideoDetailSchema = z.infer<typeof videoDetailSchema>;
export const videoDetailSchema = videoSummarySchema.extend({
  commentCount: z.number().int().min(0),
  description: z.string(),
  dislikeCount: z.number().int().min(0),
  isSubscribed: z.boolean().nullable(),
  /** Seconds to resume from, taken from the viewer's watch history. */
  resumeAtSeconds: z.number().int().min(0),
  sourceUrl: z.string().nullable(),
  tags: z.array(tagSchema),
  viewerReaction: reactionTypeSchema.nullable(),
  visibility: visibilitySchema,
});

// --- engagement ------------------------------------------------------------

export type CommentSchema = z.infer<typeof commentSchema>;
export const commentSchema = z.object({
  author: publicUserSchema,
  body: z.string(),
  createdAt: z.coerce.date(),
  edited: z.boolean(),
  id: z.string().uuid(),
  parentId: z.string().uuid().nullable(),
  replyCount: z.number().int().min(0),
});

/** A top-level comment with its replies already resolved, one level deep. */
export type CommentThreadSchema = z.infer<typeof commentThreadSchema>;
export const commentThreadSchema = commentSchema.extend({
  replies: z.array(commentSchema),
});

// --- library ---------------------------------------------------------------

export type PlaylistSummarySchema = z.infer<typeof playlistSummarySchema>;
export const playlistSummarySchema = z.object({
  description: z.string().nullable(),
  id: z.string().uuid(),
  itemCount: z.number().int().min(0),
  /** First item's poster, used as the playlist cover. */
  previewThumbnailUrl: z.string().nullable(),
  previewVideoSlug: z.string().nullable(),
  /** "watch-later" | "liked" for the two built-in playlists, null otherwise. */
  system: z.string().nullable(),
  title: z.string(),
  updatedAt: z.coerce.date(),
  visibility: visibilitySchema,
});

export type PlaylistItemSchema = z.infer<typeof playlistItemSchema>;
export const playlistItemSchema = z.object({
  addedAt: z.coerce.date(),
  id: z.string().uuid(),
  position: z.number().int().min(0),
  video: videoSummarySchema,
});

export type PlaylistSchema = z.infer<typeof playlistSchema>;
export const playlistSchema = playlistSummarySchema.extend({
  items: z.array(playlistItemSchema),
});

export type WatchHistoryEntrySchema = z.infer<typeof watchHistoryEntrySchema>;
export const watchHistoryEntrySchema = z.object({
  completed: z.boolean(),
  positionSeconds: z.number().int().min(0),
  /** 0–1, precomputed so cards do not divide by a possibly-zero duration. */
  progressRatio: z.number().min(0).max(1),
  video: videoSummarySchema,
  watchedAt: z.coerce.date(),
});

// --- session ---------------------------------------------------------------

/** The signed-in user's own record, including fields only they may read. */
export type SessionUserSchema = z.infer<typeof sessionUserSchema>;
export const sessionUserSchema = publicUserSchema.extend({
  channel: channelSummarySchema.nullable(),
  email: z.string().email(),
  role: roleSchema,
});
