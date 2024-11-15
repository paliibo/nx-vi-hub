import { z } from "zod";

import { categorySchema, channelSchema, handleSchema, videoSummarySchema } from "../types/db";
import { getPaginatedResponseValidation, paginationQuerySchema } from "../utils/validation";

export type ChannelHandleParamsSchema = z.infer<typeof channelHandleParamsSchema>;
export const channelHandleParamsSchema = z.object({ handle: handleSchema });

export type ChannelResponseSchema = z.infer<typeof channelResponseSchema>;
export const channelResponseSchema = channelSchema;

export type ListChannelVideosQuerySchema = z.infer<typeof listChannelVideosQuerySchema>;
export const listChannelVideosQuerySchema = paginationQuerySchema;

export type ListChannelVideosResponseSchema = z.infer<typeof listChannelVideosResponseSchema>;
export const listChannelVideosResponseSchema = getPaginatedResponseValidation(videoSummarySchema);

export type SubscribeResponseSchema = z.infer<typeof subscribeResponseSchema>;
export const subscribeResponseSchema = z.object({
  isSubscribed: z.boolean(),
  subscriberCount: z.number().int().min(0),
});

export type ListCategoriesResponseSchema = z.infer<typeof listCategoriesResponseSchema>;
export const listCategoriesResponseSchema = z.object({
  items: z.array(categorySchema),
});

export type CreateChannelBodySchema = z.infer<typeof createChannelBodySchema>;
export const createChannelBodySchema = z.object({
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #a3e635")
    .optional(),
  description: z.string().max(600).nullable().optional(),
  handle: handleSchema,
  name: z.string().min(2, "Use at least 2 characters").max(48),
});

export type UpdateChannelBodySchema = z.infer<typeof updateChannelBodySchema>;
export const updateChannelBodySchema = createChannelBodySchema.partial().extend({
  avatarUrl: z.string().url("Enter a valid image URL").nullable().optional(),
  bannerUrl: z.string().url("Enter a valid image URL").nullable().optional(),
});
