export const ACCESS_TOKEN_COOKIE = "vihub_access";
export const REFRESH_TOKEN_COOKIE = "vihub_refresh";

/**
 * The refresh cookie is only ever sent to the endpoints that rotate it, so a
 * stolen XSS payload on any other route has nothing to read. Access tokens are
 * short-lived and scoped to the whole API.
 */
export const REFRESH_COOKIE_PATH = "/api/web/auth";
