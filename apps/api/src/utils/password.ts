import * as argon2 from "argon2";

/**
 * argon2id with parameters at the OWASP recommended floor. Deliberately slow:
 * roughly 50ms per verification, which is negligible for a login and expensive
 * for anyone working through a leaked table.
 */
const OPTIONS: argon2.Options = {
  hashLength: 32,
  memoryCost: 19_456, // 19 MiB
  parallelism: 1,
  timeCost: 2,
  type: argon2.argon2id,
};

export const hashPassword = (plain: string): Promise<string> => argon2.hash(plain, OPTIONS);

export const verifyPassword = async (hash: string, plain: string): Promise<boolean> => {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    // A malformed or truncated hash should read as "wrong password", not as a
    // 500 that tells the caller this particular account exists.
    return false;
  }
};
