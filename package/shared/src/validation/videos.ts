import { z } from "zod";

import { VIDEO_SORT } from "../constants/catalog";
import { slugSchema, videoDetailSchema, videoIdSchema, videoSummarySchema } from "../types/db";
import { reactionTypeSchema, visibilitySchema } from "../types/enums";
import { getPaginatedResponseValidation, paginationQuerySchema } from "../utils/validation";

export const videoSortSchema = z.enum([
  VIDEO_SORT.NEWEST,
  VIDEO_SORT.OLDEST,
  VIDEO_SORT.MOST_VIEWED,
  VIDEO_SORT.TOP_RATED,
]);

export type ListVideosQuerySchema = z.infer<typeof listVideosQuerySchema>;
export const listVideosQuerySchema = paginationQuerySchema.extend({
  category: z.string().optional(),
  channel: z.string().optional(),
  /** Free-text search over title and description. */
  q: z.string().trim().max(120).optional(),
  sort: videoSortSchema.default(VIDEO_SORT.NEWEST),
  tag: z.string().optional(),
});

export type ListVideosResponseSchema = z.infer<typeof listVideosResponseSchema>;
export const listVideosResponseSchema = getPaginatedResponseValidation(videoSummarySchema);

export type VideoSlugParamsSchema = z.infer<typeof videoSlugParamsSchema>;
export const videoSlugParamsSchema = z.object({ slug: slugSchema });

export type VideoIdParamsSchema = z.infer<typeof videoIdParamsSchema>;
export const videoIdParamsSchema = z.object({ videoId: videoIdSchema });

export type VideoDetailResponseSchema = z.infer<typeof videoDetailResponseSchema>;
export const videoDetailResponseSchema = videoDetailSchema;

export type RelatedVideosResponseSchema = z.infer<typeof relatedVideosResponseSchema>;
export const relatedVideosResponseSchema = z.object({
  items: z.array(videoSummarySchema),
});

/** Shelves rendered on the home page in a single round trip. */
export type DiscoverResponseSchema = z.infer<typeof discoverResponseSchema>;
export const discoverResponseSchema = z.object({
  continueWatching: z.array(videoSummarySchema),
  featured: videoSummarySchema.nullable(),
  fresh: z.array(videoSummarySchema),
  fromSubscriptions: z.array(videoSummarySchema),
  trending: z.array(videoSummarySchema),
});

/**
 * Two types per schema with defaults. `z.infer` is what the API receives once
 * Zod has filled the defaults in; `z.input` is what a form actually holds, where
 * those same fields are still optional. Forms need the input type or the
 * resolver cannot be assigned to them.
 */
export type CreateVideoBodySchema = z.infer<typeof createVideoBodySchema>;
export type CreateVideoInputSchema = z.input<typeof createVideoBodySchema>;
export const createVideoBodySchema = z.object({
  categorySlug: z.string().optional(),
  description: z.string().max(5000, "Keep the description under 5000 characters").default(""),
  durationSeconds: z.number().int().min(0).max(86_400).default(0),
  sourceUrl: z.string().url("Enter a valid video URL").nullable().optional(),
  tags: z.array(z.string().min(1).max(30)).max(10, "Up to 10 tags").default([]),
  thumbnailUrl: z.string().url("Enter a valid image URL").nullable().optional(),
  title: z.string().min(3, "Use at least 3 characters").max(140, "Keep the title under 140"),
  visibility: visibilitySchema.default("PUBLIC"),
});

export type UpdateVideoBodySchema = z.infer<typeof updateVideoBodySchema>;
export const updateVideoBodySchema = createVideoBodySchema.partial();

export type ReactBodySchema = z.infer<typeof reactBodySchema>;
export const reactBodySchema = z.object({
  /** Null clears an existing reaction, which is how the toggle un-likes. */
  type: reactionTypeSchema.nullable(),
});

export type ReactResponseSchema = z.infer<typeof reactResponseSchema>;
export const reactResponseSchema = z.object({
  dislikeCount: z.number().int().min(0),
  likeCount: z.number().int().min(0),
  viewerReaction: reactionTypeSchema.nullable(),
});

export type ViewResponseSchema = z.infer<typeof viewResponseSchema>;
export const viewResponseSchema = z.object({
  views: z.number().int().min(0),
});

/** Typeahead results for the command palette. */
export type SearchSuggestionsQuerySchema = z.infer<typeof searchSuggestionsQuerySchema>;
export const searchSuggestionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(10).default(6),
  q: z.string().trim().min(1).max(120),
});

export type SearchSuggestionsResponseSchema = z.infer<typeof searchSuggestionsResponseSchema>;
export const searchSuggestionsResponseSchema = z.object({
  channels: z.array(
    z.object({
      accentColor: z.string(),
      avatarUrl: z.string().nullable(),
      handle: z.string(),
      id: z.string().uuid(),
      name: z.string(),
    }),
  ),
  videos: z.array(
    z.object({
      channelName: z.string(),
      durationSeconds: z.number().int().min(0),
      id: videoIdSchema,
      slug: z.string(),
      title: z.string(),
    }),
  ),
});
