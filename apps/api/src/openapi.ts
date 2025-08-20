import { generateOpenApi } from "@ts-rest/open-api";

import { webContract } from "@/shared/api";

/**
 * Generated from the contract, so the documentation cannot describe an endpoint
 * that no longer exists. The previous setup ran swagger-jsdoc over hand-written
 * comment blocks, which had already drifted from the routes they described.
 */
export const openApiDocument = generateOpenApi(
  webContract,
  {
    components: {
      securitySchemes: {
        cookieAuth: {
          description: "Set automatically by /api/web/auth/sign-in.",
          in: "cookie",
          name: "vihub_access",
          type: "apiKey",
        },
      },
    },
    info: {
      description:
        "Vi Hub is a self-hostable video hub. Every route below is generated from " +
        "the ts-rest contract shared by the API and the web app.\n\n" +
        "Sign in with demo@vihub.dev / demo1234 to exercise the authenticated routes.",
      title: "Vi Hub API",
      version: "1.0.0",
    },
    servers: [{ description: "Local development", url: "http://localhost:4308" }],
  },
  // "concatenated-path" derives the id from the full path. Plain `true` uses the
  // router key, which must then be globally unique — and `create`, `list` and
  // `update` legitimately appear under videos, channels and comments alike.
  { setOperationId: "concatenated-path" },
);
