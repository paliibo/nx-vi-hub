/**
 * Type-only surface of the data layer, safe to import from anywhere including
 * client components. Anything that needs to run a query imports
 * `@nx-vi-hub/db/server`.
 */
export type {
  Category,
  Channel,
  Comment,
  Playlist,
  PlaylistItem,
  Reaction,
  RefreshToken,
  Subscription,
  Tag,
  User,
  Video,
  VideoTag,
  WatchHistory,
} from "@prisma/client";
