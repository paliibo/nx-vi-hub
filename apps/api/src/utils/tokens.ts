import { createHash, randomBytes } from "crypto";
import jwt from "jsonwebtoken";

import { env } from "../env";

export type AccessTokenPayload = {
  sub: string;
  username: string;
};

export const signAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL,
  } as jwt.SignOptions);

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
    if (typeof decoded === "string" || !decoded.sub) return null;
    return { sub: String(decoded.sub), username: String(decoded["username"] ?? "") };
  } catch {
    return null;
  }
};

/**
 * Refresh tokens are opaque random strings rather than JWTs. There is nothing
 * to read out of them, and because every one is a row in the database they can
 * be revoked individually — which a self-contained JWT cannot be.
 */
export const generateRefreshToken = (): string => randomBytes(48).toString("base64url");

/**
 * Only the hash is stored. Refresh tokens are high entropy, so a single SHA-256
 * is enough here; the slow KDF used for passwords exists to survive a dictionary
 * attack, which does not apply to 48 random bytes.
 */
export const hashRefreshToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

const DURATION_PATTERN = /^(\d+)\s*(ms|s|m|h|d|w|y)$/i;

const UNIT_MS: Record<string, number> = {
  d: 24 * 60 * 60 * 1000,
  h: 60 * 60 * 1000,
  m: 60 * 1000,
  ms: 1,
  s: 1000,
  w: 7 * 24 * 60 * 60 * 1000,
  y: 365 * 24 * 60 * 60 * 1000,
};

/**
 * Converts the same duration strings `jsonwebtoken` accepts ("15m", "30d") into
 * milliseconds, so the cookie Max-Age and the token expiry cannot drift apart.
 */
export const durationToMs = (value: string): number => {
  const match = DURATION_PATTERN.exec(value.trim());
  if (!match) throw new Error(`Unsupported duration: "${value}". Use a form like 15m or 30d.`);
  return Number(match[1]) * UNIT_MS[match[2].toLowerCase()];
};

export const refreshTokenExpiry = (): Date =>
  new Date(Date.now() + durationToMs(env.REFRESH_TOKEN_TTL));
