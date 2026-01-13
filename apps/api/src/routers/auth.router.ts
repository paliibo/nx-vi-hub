import { initServer } from "@ts-rest/express";

import { webContract } from "@/shared/api";
import { REFRESH_TOKEN_COOKIE, STATUS_CODES } from "@/shared/constants";
import { UnauthorizedError } from "@/shared/utils";

import { currentUser, requireAuth } from "../middleware/auth";
import { clearAuthCookies, setAuthCookies } from "../middleware/cookies";
import { authService } from "../services";

const s = initServer();

export const authRouter = s.router(webContract.auth, {
  changePassword: {
    handler: async ({ body, req }) => {
      await authService.changePassword(currentUser(req).id, body);
      return { body: { ok: true as const }, status: STATUS_CODES.SUCCESS };
    },
    middleware: [requireAuth],
  },

  logout: async ({ req, res }) => {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (typeof token === "string" && token) {
      await authService.revokeRefreshToken(token);
    }
    clearAuthCookies(res);
    return { body: { ok: true as const }, status: STATUS_CODES.SUCCESS };
  },

  me: {
    handler: async ({ req }) => ({
      body: await authService.getSessionUser(currentUser(req).id),
      status: STATUS_CODES.SUCCESS,
    }),
    middleware: [requireAuth],
  },

  refresh: async ({ req, res }) => {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (typeof token !== "string" || !token) {
      throw new UnauthorizedError("No session to refresh");
    }

    const session = await authService.refreshSession(token);
    setAuthCookies(res, session);

    // The tokens themselves are not echoed in the body — they are already in
    // httpOnly cookies, and repeating them would put them somewhere a script
    // can read.
    return { body: { user: session.user }, status: STATUS_CODES.SUCCESS };
  },

  signIn: async ({ body, res }) => {
    const session = await authService.signIn(body);
    setAuthCookies(res, session);
    return { body: { user: session.user }, status: STATUS_CODES.SUCCESS };
  },

  signUp: async ({ body, res }) => {
    const session = await authService.signUp(body);
    setAuthCookies(res, session);
    return { body: { user: session.user }, status: STATUS_CODES.CREATED };
  },

  updateProfile: {
    handler: async ({ body, req }) => ({
      body: await authService.updateProfile(currentUser(req).id, body),
      status: STATUS_CODES.SUCCESS,
    }),
    middleware: [requireAuth],
  },
});
