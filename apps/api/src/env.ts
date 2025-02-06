import { config } from "dotenv";
import { join } from "path";
import { z } from "zod";

// Load the single root .env before anything reads process.env. The path is
// relative to this file so it resolves the same from src/ and from dist/.
config({ path: join(__dirname, "../../../.env"), quiet: true });

const envSchema = z.object({
  ACCESS_TOKEN_SECRET: z.string().min(16, "ACCESS_TOKEN_SECRET must be at least 16 characters"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(4308),
  REFRESH_TOKEN_SECRET: z.string().min(16, "REFRESH_TOKEN_SECRET must be at least 16 characters"),
  REFRESH_TOKEN_TTL: z.string().default("30d"),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map(issue => `  • ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  // Failing here beats booting with an undefined signing secret and minting
  // tokens that every other process would reject.
  throw new Error(`Invalid environment configuration:\n${issues}\n\nCopy .env.example to .env.`);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";

/**
 * The two secrets must differ, otherwise an access token would validate as a
 * refresh token and a stolen 15-minute token would become a 30-day one.
 */
if (env.ACCESS_TOKEN_SECRET === env.REFRESH_TOKEN_SECRET) {
  throw new Error(
    "ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be different values — " +
      "sharing them lets an access token be replayed as a refresh token.",
  );
}
