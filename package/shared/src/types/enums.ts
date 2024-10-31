import { z } from "zod";

/**
 * Mirrors of the Prisma enums. They are redeclared as Zod enums rather than
 * imported from @prisma/client so that client bundles can validate a response
 * without pulling the query engine in with them.
 */

export const ROLE = { ADMIN: "ADMIN", USER: "USER" } as const;
export type Role = (typeof ROLE)[keyof typeof ROLE];
export const roleSchema = z.enum(["USER", "ADMIN"]);

export const VISIBILITY = {
  PRIVATE: "PRIVATE",
  PUBLIC: "PUBLIC",
  UNLISTED: "UNLISTED",
} as const;
export type Visibility = (typeof VISIBILITY)[keyof typeof VISIBILITY];
export const visibilitySchema = z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]);

export const REACTION_TYPE = { DISLIKE: "DISLIKE", LIKE: "LIKE" } as const;
export type ReactionType = (typeof REACTION_TYPE)[keyof typeof REACTION_TYPE];
export const reactionTypeSchema = z.enum(["LIKE", "DISLIKE"]);
