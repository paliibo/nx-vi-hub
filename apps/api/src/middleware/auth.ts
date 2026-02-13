import type { NextFunction, Request, Response } from "express";

import { ACCESS_TOKEN_COOKIE, STATUS_CODES } from "@/shared/constants";
import { UnauthorizedError } from "@/shared/utils";

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
 * Only the parts of the request these middlewares actually touch.
 *
 * ts-rest narrows `req.query` and `req.params` to each route's parsed schema,
 * so a handler typed against the full Express `Request` is not assignable to
 * `TsRestRequestHandler` — a parsed `{ page: number }` is not a `ParsedQs`.
 * Naming only what is read keeps these usable both as global middleware and as
 * per-route middleware on any route.
 */
type AuthAwareRequest = Pick<Request, "cookies" | "headers"> & {
  user?: AuthenticatedUser;
};

/**
 * The access token is read from the httpOnly cookie first and from an
 * Authorization header second. The cookie is what the web app uses; the header
 * keeps the API usable from curl and from the OpenAPI page.
 */
const extractToken = (req: AuthAwareRequest): null | string => {
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
export const attachUser = (req: AuthAwareRequest, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) return next();

  const payload = verifyAccessToken(token);
  if (payload) {
    req.user = { id: payload.sub, username: payload.username };
  }

  next();
};

/** Rejects the request unless `attachUser` found a valid token. */
export const requireAuth = (req: AuthAwareRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(STATUS_CODES.UNAUTHORIZED).json({
      message: "Sign in to continue",
      name: "UnauthorizedError",
    });
    return;
  }
  next();
};

/**
 * Reads the authenticated user off a request that has already passed
 * `requireAuth`.
 *
 * Handlers previously wrote `req.user!.id`. The assertion was true in practice
 * but silent if wrong: forget requireAuth on a new route and the handler reads
 * `undefined.id` and answers 500 instead of 401. Checking here turns that
 * mistake into the correct response.
 */
export const currentUser = (req: { user?: AuthenticatedUser }): AuthenticatedUser => {
  if (!req.user) {
    throw new UnauthorizedError("Sign in to continue");
  }
  return req.user;
};
