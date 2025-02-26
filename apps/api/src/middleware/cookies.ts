import type { CookieOptions, Response } from "express";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_COOKIE_PATH,
  REFRESH_TOKEN_COOKIE,
} from "@/shared/constants";

import { env, isProduction } from "../env";
import { durationToMs } from "../utils/tokens";

const baseOptions = (): CookieOptions => ({
  httpOnly: true,
  // Lax still sends the cookie on a top-level navigation, so following a shared
  // watch link keeps you signed in, while cross-site POSTs get nothing.
  sameSite: "lax",
  secure: isProduction,
});

export const setAuthCookies = (res: Response, tokens: {
  accessToken: string;
  refreshToken: string;
}) => {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseOptions(),
    maxAge: durationToMs(env.ACCESS_TOKEN_TTL),
  });

  // Scoped to the auth routes: nothing else needs to see it, so an XSS payload
  // on a watch page cannot read it even if httpOnly were somehow bypassed.
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...baseOptions(),
    maxAge: durationToMs(env.REFRESH_TOKEN_TTL),
    path: REFRESH_COOKIE_PATH,
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, baseOptions());
  res.clearCookie(REFRESH_TOKEN_COOKIE, { ...baseOptions(), path: REFRESH_COOKIE_PATH });
};
