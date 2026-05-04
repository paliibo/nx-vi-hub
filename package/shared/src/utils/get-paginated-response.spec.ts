import { getPaginatedResponse } from "./get-paginated-response";

describe("getPaginatedResponse", () => {
  it("computes the page count by rounding up", () => {
    const { pagination } = getPaginatedResponse([], { count: 25, limit: 10, page: 1 });
    expect(pagination.totalPages).toBe(3);
  });

  it("reports one page when there is nothing to show", () => {
    // Zero pages would render pagination controls with no pages in them.
    const { pagination } = getPaginatedResponse([], { count: 0, limit: 10, page: 1 });
    expect(pagination.totalPages).toBe(1);
  });

  it("clamps a page number below one", () => {
    const { pagination } = getPaginatedResponse([], { count: 10, limit: 10, page: 0 });
    expect(pagination.page).toBe(1);
  });

  it("passes the items through untouched", () => {
    const items = [{ id: "a" }, { id: "b" }];
    expect(getPaginatedResponse(items, { count: 2, limit: 10, page: 1 }).items).toBe(items);
  });
});
