import { signInBodySchema, signUpBodySchema, signUpFormSchema } from "./auth";

describe("signInBodySchema", () => {
  it("requires a well-formed email", () => {
    expect(signInBodySchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
    expect(signInBodySchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
  });
});

describe("signUpBodySchema", () => {
  const valid = {
    email: "someone@example.com",
    password: "correcthorse",
    username: "someone",
  };

  it("accepts a well-formed body", () => {
    expect(signUpBodySchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a password shorter than eight characters", () => {
    expect(signUpBodySchema.safeParse({ ...valid, password: "short" }).success).toBe(false);
  });

  it("rejects usernames with characters that would not survive a URL", () => {
    for (const username of ["Has Spaces", "UPPER", "emoji🙂", "sym$bol"]) {
      expect(signUpBodySchema.safeParse({ ...valid, username }).success).toBe(false);
    }
  });
});

describe("signUpFormSchema", () => {
  const base = {
    agree: true as const,
    confirmPassword: "correcthorse",
    email: "someone@example.com",
    password: "correcthorse",
    username: "someone",
  };

  it("accepts matching passwords with the terms accepted", () => {
    expect(signUpFormSchema.safeParse(base).success).toBe(true);
  });

  it("reports mismatched passwords against the confirmation field", () => {
    const result = signUpFormSchema.safeParse({ ...base, confirmPassword: "different" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
    }
  });

  it("requires the terms checkbox", () => {
    expect(signUpFormSchema.safeParse({ ...base, agree: false }).success).toBe(false);
  });
});
