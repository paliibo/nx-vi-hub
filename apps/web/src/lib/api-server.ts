import "server-only";
import { initClient } from "@ts-rest/core";
import { cookies } from "next/headers";

import { webContract } from "@/shared/api";
import { STATUS_CODES } from "@/shared/constants";

import { SERVER_API_BASE_URL } from "./config";

/**
 * Server-side client used by React Server Components.
 *
 * The browser's cookies are not attached automatically here — the request is
 * made by the Next.js process, not the user's browser — so the incoming cookie
 * header is forwarded verbatim. Without this every page would render as though
 * nobody were signed in.
 */
export const serverApi = initClient(webContract, {
  api: async ({ body, fetchOptions, headers, method, path }) => {
    const cookieHeader = (await cookies()).toString();

    let response: Response;

    try {
      response = await fetch(path, {
        ...fetchOptions,
        body,
        // The catalog changes as people publish and comment, so a stale render
        // is worse than an extra request.
        cache: "no-store",
        headers: {
          ...headers,
          ...(cookieHeader ? { cookie: cookieHeader } : {}),
        },
        method,
      });
    } catch {
      // The API being unreachable is an expected state — it is a separate
      // process, and in development it is often simply not running yet. Turning
      // the thrown fetch error into a response lets pages fall through to their
      // empty state via okOrNull instead of the whole route throwing a 500.
      return {
        body: { message: "The API is not reachable.", name: "ServerError" },
        headers: new Headers(),
        status: STATUS_CODES.SERVER_ERROR,
      };
    }

    const contentType = response.headers.get("content-type") ?? "";
    const responseBody = contentType.includes("json")
      ? await response.json()
      : await response.text();

    return { body: responseBody, headers: response.headers, status: response.status };
  },
  baseUrl: SERVER_API_BASE_URL,
  throwOnUnknownStatus: false,
});

/**
 * Returns the success body, or null for any non-2xx. Pages use this when a
 * missing or forbidden resource should render an empty state rather than crash.
 */
export const okOrNull = <TBody>(result: { body: unknown; status: number }): null | TBody =>
  result.status >= 200 && result.status < 300 ? (result.body as TBody) : null;
