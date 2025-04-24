import type {
  ChangePasswordBodySchema,
  SignInBodySchema,
  SignUpBodySchema,
  UpdateProfileBodySchema,
} from "@/shared/validation";

import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "@/shared/utils";
import { prisma } from "@nx-vi-hub/db/server";

import { sessionUserSelect, toSessionUser } from "../mappers";
import { hashPassword, verifyPassword } from "../utils/password";
import {
  generateRefreshToken,
  hashRefreshToken,
  refreshTokenExpiry,
  signAccessToken,
} from "../utils/tokens";

export type IssuedSession = {
  accessToken: string;
  refreshToken: string;
  user: ReturnType<typeof toSessionUser>;
};

const issueSession = async (userId: string): Promise<IssuedSession> => {
  const user = await prisma.user.findUnique({
    select: sessionUserSelect,
    where: { id: userId },
  });
  if (!user) throw new NotFoundError("Account not found");

  const refreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      expiresAt: refreshTokenExpiry(),
      tokenHash: hashRefreshToken(refreshToken),
      userId,
    },
  });

  return {
    accessToken: signAccessToken({ sub: user.id, username: user.username }),
    refreshToken,
    user: toSessionUser(user),
  };
};

/**
 * A genuine argon2id digest of a value nobody can sign in with, at the same
 * parameters as a real password. Verifying against it burns the same ~15ms as a
 * real check, so a missing account and a wrong password are indistinguishable
 * from the response time. A fabricated string would not work here: argon2 would
 * reject it as malformed and return in microseconds, restoring the very timing
 * signal this exists to remove.
 */
const DUMMY_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$aqUvLG4YYphkueItoqZsiw$e9kQHF3CMV2Lsj6UaMtCtu19xLNmB/+8JZ2E+mZKKg4";

export const signUp = async (body: SignUpBodySchema): Promise<IssuedSession> => {
  const email = body.email.toLowerCase().trim();
  const username = body.username.toLowerCase().trim();

  const existing = await prisma.user.findFirst({
    select: { email: true, username: true },
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    // Naming which field collided is fine here: sign-up already reveals whether
    // an email is taken by refusing it, so hiding it buys nothing and costs the
    // user a guessing game.
    throw new ConflictError(
      existing.email === email ? "That email is already registered" : "That username is taken",
    );
  }

  const user = await prisma.user.create({
    data: {
      displayName: body.displayName?.trim() || username,
      email,
      passwordHash: await hashPassword(body.password),
      username,
    },
    select: { id: true },
  });

  return issueSession(user.id);
};

export const signIn = async (body: SignInBodySchema): Promise<IssuedSession> => {
  const email = body.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    select: { id: true, passwordHash: true },
    where: { email },
  });

  // Verify against a dummy hash when the account does not exist, so a missing
  // account and a wrong password take the same time to answer. Skipping the
  // work would make user enumeration measurable from the response latency.
  const isValid = user
    ? await verifyPassword(user.passwordHash, body.password)
    : await verifyPassword(DUMMY_HASH, body.password);

  if (!user || !isValid) throw new UnauthorizedError("Email or password is incorrect");

  return issueSession(user.id);
};

export const refreshSession = async (token: string): Promise<IssuedSession> => {
  const tokenHash = hashRefreshToken(token);

  const stored = await prisma.refreshToken.findUnique({
    select: { expiresAt: true, id: true, revokedAt: true, userId: true },
    where: { tokenHash },
  });

  if (!stored || stored.revokedAt || stored.expiresAt.getTime() < Date.now()) {
    throw new UnauthorizedError("Your session has expired, please sign in again");
  }

  // Rotate: the presented token is spent the moment it is accepted, so a
  // replay of the same value finds it revoked.
  await prisma.refreshToken.update({
    data: { revokedAt: new Date() },
    where: { id: stored.id },
  });

  return issueSession(stored.userId);
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  await prisma.refreshToken.updateMany({
    data: { revokedAt: new Date() },
    where: { revokedAt: null, tokenHash: hashRefreshToken(token) },
  });
};

export const getSessionUser = async (userId: string) => {
  const user = await prisma.user.findUnique({ select: sessionUserSelect, where: { id: userId } });
  if (!user) throw new NotFoundError("Account not found");
  return toSessionUser(user);
};

export const updateProfile = async (userId: string, body: UpdateProfileBodySchema) => {
  const user = await prisma.user.update({
    data: {
      avatarUrl: body.avatarUrl,
      bio: body.bio,
      ...(body.displayName ? { displayName: body.displayName.trim() } : {}),
    },
    select: sessionUserSelect,
    where: { id: userId },
  });

  return toSessionUser(user);
};

export const changePassword = async (userId: string, body: ChangePasswordBodySchema) => {
  const user = await prisma.user.findUnique({
    select: { passwordHash: true },
    where: { id: userId },
  });
  if (!user) throw new NotFoundError("Account not found");

  if (!(await verifyPassword(user.passwordHash, body.currentPassword))) {
    throw new BadRequestError("Your current password is not correct");
  }

  await prisma.$transaction([
    prisma.user.update({
      data: { passwordHash: await hashPassword(body.newPassword) },
      where: { id: userId },
    }),
    // Changing a password is how someone reacts to a compromise, so every other
    // session has to stop working — otherwise the attacker keeps their own.
    prisma.refreshToken.updateMany({
      data: { revokedAt: new Date() },
      where: { revokedAt: null, userId },
    }),
  ]);
};

/** Housekeeping for expired and long-revoked rows. Safe to call on a schedule. */
export const pruneRefreshTokens = async (): Promise<number> => {
  const { count } = await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return count;
};
