import { type NextRequest, NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/shared/constants";

/**
 * Routes that make no sense without an account.
 *
 * The layouts already call requireSession, but a redirect thrown once rendering
 * has begun cannot change the status code: Next answers 200 with an RSC payload
 * telling the client to navigate. That works in a browser, yet it means the
 * server renders a page nobody is allowed to see and returns 200 for it.
 * Redirecting here happens before any of that.
 */
const PROTECTED_PREFIXES = ["/library", "/studio", "/settings", "/subscriptions"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Presence of the cookie only — verifying the signature needs the secret,
  // which does not belong in the edge bundle. This is the cheap gate; the
  // layout's requireSession is still the authoritative check, so a forged or
  // expired cookie gets no further than the next server render.
  if (request.cookies.has(ACCESS_TOKEN_COOKIE)) {
    return NextResponse.next();
  }

  const signIn = new URL("/sign-in", request.url);
  signIn.searchParams.set("next", pathname);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/library/:path*", "/studio/:path*", "/settings/:path*", "/subscriptions/:path*"],
};
