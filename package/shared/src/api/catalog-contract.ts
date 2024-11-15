import { STATUS_CODES } from "../constants";
import { ContractInstance } from "../types/general";
import {
  discoverResponseSchema,
  listCategoriesResponseSchema,
  searchSuggestionsQuerySchema,
  searchSuggestionsResponseSchema,
} from "../validation";
import { commonErrors } from "./responses";

/**
 * Read-only browse endpoints. Separate from `/videos` so none of these paths
 * can ever collide with a video slug.
 */
export const catalogContract = (c: ContractInstance) =>
  c.router(
    {
      categories: {
        method: "GET",
        path: "/categories",
        responses: {
          ...commonErrors,
          [STATUS_CODES.SUCCESS]: listCategoriesResponseSchema,
        },
        summary: "List categories with their video counts",
      },
      discover: {
        method: "GET",
        path: "/discover",
        responses: {
          ...commonErrors,
          [STATUS_CODES.SUCCESS]: discoverResponseSchema,
        },
        summary: "Every home page shelf in one request",
      },
      suggest: {
        method: "GET",
        path: "/suggest",
        query: searchSuggestionsQuerySchema,
        responses: {
          ...commonErrors,
          [STATUS_CODES.SUCCESS]: searchSuggestionsResponseSchema,
        },
        summary: "Typeahead results for the command palette",
      },
    },
    { pathPrefix: "/catalog" },
  );
