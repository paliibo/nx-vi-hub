import { z } from "zod";

import { STATUS_CODES } from "../constants";
import { ContractInstance } from "../types/general";
import {
  authResponseSchema,
  changePasswordBodySchema,
  meResponseSchema,
  refreshResponseSchema,
  signInBodySchema,
  signUpBodySchema,
  updateProfileBodySchema,
} from "../validation";
import { authErrors, commonErrors, conflictErrors } from "./responses";

/**
 * Tokens are delivered as httpOnly cookies rather than in the response body, so
 * these routes return the user and nothing a script could exfiltrate.
 */
export const authContract = (c: ContractInstance) =>
  c.router(
    {
      changePassword: {
        body: changePasswordBodySchema,
        method: "POST",
        path: "/change-password",
        responses: {
          ...authErrors,
          [STATUS_CODES.SUCCESS]: z.object({ ok: z.literal(true) }),
        },
        summary: "Change the current user's password and revoke other sessions",
      },
      logout: {
        body: z.object({}).optional(),
        method: "POST",
        path: "/logout",
        responses: {
          ...commonErrors,
          [STATUS_CODES.SUCCESS]: z.object({ ok: z.literal(true) }),
        },
        summary: "Revoke the current refresh token and clear auth cookies",
      },
      me: {
        method: "GET",
        path: "/me",
        responses: {
          ...authErrors,
          [STATUS_CODES.SUCCESS]: meResponseSchema,
        },
        summary: "Read the signed-in user",
      },
      refresh: {
        body: z.object({}).optional(),
        method: "POST",
        path: "/refresh",
        responses: {
          ...authErrors,
          [STATUS_CODES.SUCCESS]: refreshResponseSchema,
        },
        summary: "Rotate the refresh token and mint a new access token",
      },
      signIn: {
        body: signInBodySchema,
        method: "POST",
        path: "/sign-in",
        responses: {
          ...commonErrors,
          [STATUS_CODES.SUCCESS]: authResponseSchema,
          [STATUS_CODES.UNAUTHORIZED]: commonErrors[STATUS_CODES.BAD_REQUEST],
        },
        summary: "Exchange credentials for a session",
      },
      signUp: {
        body: signUpBodySchema,
        method: "POST",
        path: "/sign-up",
        responses: {
          ...conflictErrors,
          [STATUS_CODES.CREATED]: authResponseSchema,
        },
        summary: "Create an account and sign in",
      },
      updateProfile: {
        body: updateProfileBodySchema,
        method: "PATCH",
        path: "/profile",
        responses: {
          ...authErrors,
          [STATUS_CODES.SUCCESS]: meResponseSchema,
        },
        summary: "Update the signed-in user's display name, bio or avatar",
      },
    },
    { pathPrefix: "/auth" },
  );
