/**
 * The two base URLs are genuinely different values, not a fallback chain.
 *
 * React Server Components run inside the Next.js process and may reach the API
 * over an internal address; the browser bundle needs an address the user's
 * machine can resolve. They coincide in development and diverge the moment the
 * API moves behind a private network.
 */
export const SERVER_API_BASE_URL =
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4308";

export const BROWSER_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4308";

export const APP_NAME = "Vi Hub";
export const APP_TAGLINE = "A self-hostable video hub";
