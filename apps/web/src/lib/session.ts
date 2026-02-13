import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";

import type { SessionUserSchema } from "@/shared/types/db";

import { okOrNull, serverApi } from "./api-server";

/**
 * Wrapped in React's `cache` so a layout, a page and three server components
 * asking "who is signed in?" during one render resolve to a single API call.
 */
export const getSession = cache(async (): Promise<null | SessionUserSchema> => {
  const result = await serverApi.auth.me();
  return okOrNull<SessionUserSchema>(result);
});

export const requireSession = async (returnTo?: string): Promise<SessionUserSchema> => {
  const session = await getSession();
  if (session) return session;

  const target = returnTo ? `?next=${encodeURIComponent(returnTo)}` : "";
  redirect(`/sign-in${target}`);
};

export const redirectIfSignedIn = async (to = "/") => {
  if (await getSession()) redirect(to);
};
