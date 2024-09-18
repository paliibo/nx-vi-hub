import { PrismaClient } from "@prisma/client";

/**
 * Next.js reloads server modules on every edit in development, and each reload
 * would otherwise open a fresh pool until Postgres refuses new connections.
 * Caching the client on `globalThis` keeps exactly one pool per process.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
