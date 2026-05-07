import { durationToMs, generateRefreshToken, hashRefreshToken } from "./tokens";

describe("durationToMs", () => {
  it("understands the units jsonwebtoken accepts", () => {
    expect(durationToMs("500ms")).toBe(500);
    expect(durationToMs("30s")).toBe(30_000);
    expect(durationToMs("15m")).toBe(900_000);
    expect(durationToMs("12h")).toBe(43_200_000);
    expect(durationToMs("30d")).toBe(2_592_000_000);
  });

  it("ignores surrounding whitespace and case", () => {
    expect(durationToMs("  15M ")).toBe(900_000);
  });

  it("throws on a value it cannot convert, rather than silently returning NaN", () => {
    // A NaN cookie maxAge produces a session cookie, so a typo here would
    // quietly sign people out when they close the browser.
    expect(() => durationToMs("soon")).toThrow(/Unsupported duration/);
    expect(() => durationToMs("15 fortnights")).toThrow(/Unsupported duration/);
  });
});

describe("refresh tokens", () => {
  it("generates a distinct high-entropy token each time", () => {
    const tokens = new Set(Array.from({ length: 200 }, generateRefreshToken));
    expect(tokens.size).toBe(200);
  });

  it("produces URL-safe output that survives a cookie round trip", () => {
    for (let index = 0; index < 20; index += 1) {
      expect(generateRefreshToken()).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });

  it("hashes deterministically so a stored hash can be looked up", () => {
    const token = generateRefreshToken();
    expect(hashRefreshToken(token)).toBe(hashRefreshToken(token));
  });

  it("does not reveal the token in its hash", () => {
    const token = generateRefreshToken();
    const hash = hashRefreshToken(token);
    expect(hash).not.toContain(token);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
