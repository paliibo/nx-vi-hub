"use client";

import { initClient } from "@ts-rest/core";

import { webContract } from "@/shared/api";

import { BROWSER_API_BASE_URL } from "./config";

/**
 * Browser client. `credentials: "include"` is what lets the auth cookies set by
 * the API travel with each request — the whole session scheme depends on it,
 * and fetch omits cookies cross-origin without it.
 */
export const api = initClient(webContract, {
  baseUrl: BROWSER_API_BASE_URL,
  credentials: "include",
  throwOnUnknownStatus: false,
});

/**
 * Narrows a ts-rest result to its success body, or throws with the message the
 * API sent. Callers that want to branch on status can still read `result.status`
 * directly; this is for the common case of "give me the data or tell me why not".
 */
export const unwrap = <TBody>(result: { body: unknown; status: number }): TBody => {
  if (result.status >= 200 && result.status < 300) return result.body as TBody;

  const body = result.body as null | { message?: string };
  throw new Error(body?.message ?? `Request failed with status ${result.status}`);
};
