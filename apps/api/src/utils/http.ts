import { STATUS_CODES } from "@/shared/constants";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
} from "@/shared/utils/errors";

/**
 * Small constructors for the response envelopes the contract declares. Handlers
 * `return notFound("Video")` instead of assembling `{ status, body }` by hand,
 * which keeps the literal status types that ts-rest needs to check them.
 */

export const badRequest = (message: string) => ({
  body: { message, name: "BadRequestError" as const },
  status: STATUS_CODES.BAD_REQUEST,
});

export const unauthorized = (message = "Sign in to continue") => ({
  body: { message, name: "UnauthorizedError" as const },
  status: STATUS_CODES.UNAUTHORIZED,
});

export const forbidden = (message = "You do not have access to this") => ({
  body: { message, name: "ForbiddenError" as const },
  status: STATUS_CODES.FORBIDDEN,
});

export const notFound = (subject = "Resource") => ({
  body: { message: `${subject} not found`, name: "NotFoundError" as const },
  status: STATUS_CODES.NOT_FOUND,
});

export const conflict = (message: string) => ({
  body: { message, name: "ConflictError" as const },
  status: STATUS_CODES.CONFLICT,
});

export const serverError = (message = "Something went wrong") => ({
  body: { message, name: "InternalServerError" as const },
  status: STATUS_CODES.SERVER_ERROR,
});

export const ERROR_CONSTRUCTORS = {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
};
