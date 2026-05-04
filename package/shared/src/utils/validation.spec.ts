import { MAX_PAGE_SIZE } from "../constants/catalog";
import { paginationQuerySchema } from "./validation";

describe("paginationQuerySchema", () => {
  it("coerces the strings a query string actually delivers", () => {
    expect(paginationQuerySchema.parse({ limit: "20", page: "3" })).toEqual({
      limit: 20,
      page: 3,
    });
  });

  it("defaults both fields so a bare request is valid", () => {
    const parsed = paginationQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBeGreaterThan(0);
  });

  it("rejects a limit above the cap rather than reading the whole catalog", () => {
    expect(paginationQuerySchema.safeParse({ limit: String(MAX_PAGE_SIZE + 1) }).success).toBe(
      false,
    );
  });

  it("rejects page 0, which would skip nothing and repeat the first page", () => {
    expect(paginationQuerySchema.safeParse({ page: "0" }).success).toBe(false);
  });
});
