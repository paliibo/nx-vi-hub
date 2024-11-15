import { initContract } from "@ts-rest/core";

import { authContract } from "./auth-contract";
import { catalogContract } from "./catalog-contract";
import { channelsContract } from "./channels-contract";
import { commentsContract } from "./comments-contract";
import { libraryContract } from "./library-contract";
import { videosContract } from "./videos-contract";

const c = initContract();

/**
 * The single source of truth for the HTTP surface. The Express app implements
 * it and the Next.js app consumes it, so a route that changes shape here fails
 * to compile on both sides rather than at runtime in one of them.
 */
export const webContract = c.router(
  {
    auth: authContract(c),
    catalog: catalogContract(c),
    channels: channelsContract(c),
    comments: commentsContract(c),
    library: libraryContract(c),
    videos: videosContract(c),
  },
  {
    pathPrefix: "/api/web",
    strictStatusCodes: true,
  },
);

export type WebContract = typeof webContract;
