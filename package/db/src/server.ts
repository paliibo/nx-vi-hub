export { prisma } from "./client";
/**
 * Server-only entry point. Importing this pulls in the generated Prisma engine,
 * so it must never be reached from a browser bundle — use `@nx-vi-hub/db` for
 * the types instead.
 */
export { Prisma, PrismaClient } from "@prisma/client";
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
