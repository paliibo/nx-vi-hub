import type { NextFunction, Request, Response } from "express";

import { ACCESS_TOKEN_COOKIE, STATUS_CODES } from "@/shared/constants";

import { verifyAccessToken } from "../utils/tokens";

export type AuthenticatedUser = {
  id: string;
  username: string;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * The access token is read from the httpOnly cookie first and from an
 * Authorization header second. The cookie is what the web app uses; the header
 * keeps the API usable from curl and from the OpenAPI page.
 */
const extractToken = (req: Request): null | string => {
  const cookieToken = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (typeof cookieToken === "string" && cookieToken.length > 0) return cookieToken;

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length);

  return null;
};

/**
 * Populates req.user when a valid token is present and does nothing otherwise.
 * Runs on every route: public endpoints still need to know who is asking, since
 * a video's `viewerReaction` depends on it.
 */
export const attachUser = (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) return next();

  const payload = verifyAccessToken(token);
  if (payload) {
    req.user = { id: payload.sub, username: payload.username };
  }

  next();
};

/** Rejects the request unless `attachUser` found a valid token. */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(STATUS_CODES.UNAUTHORIZED).json({
      message: "Sign in to continue",
      name: "UnauthorizedError",
    });
    return;
  }
  next();
};
