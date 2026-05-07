import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies a correct password", async () => {
    const hash = await hashPassword("correcthorse");
    await expect(verifyPassword(hash, "correcthorse")).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correcthorse");
    await expect(verifyPassword(hash, "batterystaple")).resolves.toBe(false);
  });

  it("salts, so the same password hashes differently every time", async () => {
    const [first, second] = await Promise.all([
      hashPassword("correcthorse"),
      hashPassword("correcthorse"),
    ]);
    expect(first).not.toBe(second);
  });

  it("uses argon2id at the parameters we configured", async () => {
    expect(await hashPassword("correcthorse")).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
  });

  it("treats a malformed hash as a wrong password rather than throwing", async () => {
    // A 500 here would tell an attacker this particular row exists but is
    // corrupt; false is both safer and honest.
    await expect(verifyPassword("not-a-hash", "anything")).resolves.toBe(false);
  });
});
