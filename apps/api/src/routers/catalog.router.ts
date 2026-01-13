import { initServer } from "@ts-rest/express";

import { webContract } from "@/shared/api";
import { STATUS_CODES } from "@/shared/constants";

import { catalogService } from "../services";

const s = initServer();

export const catalogRouter = s.router(webContract.catalog, {
  categories: async () => ({
    body: await catalogService.listCategories(),
    status: STATUS_CODES.SUCCESS,
  }),

  discover: async ({ req }) => ({
    body: await catalogService.getDiscoverFeed(req.user?.id),
    status: STATUS_CODES.SUCCESS,
  }),

  suggest: async ({ query }) => ({
    body: await catalogService.getSuggestions(query),
    status: STATUS_CODES.SUCCESS,
  }),
});
