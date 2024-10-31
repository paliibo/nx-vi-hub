import { STATUS_CODES } from "../constants";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  JWTError,
  NotFoundError,
  RequestValidationError,
  ResponseValidationError,
  ServerError,
  UnauthorizedError,
} from "../utils/errors";

/**
 * Every endpoint can fail to parse its input or blow up on the server, so those
 * two shapes are spread into each route rather than retyped fourteen times.
 */
export const commonErrors = {
  [STATUS_CODES.BAD_REQUEST]: BadRequestError.zodSchema
    .or(ResponseValidationError.zodSchema)
    .or(RequestValidationError.zodSchema),
  [STATUS_CODES.SERVER_ERROR]: ServerError.zodSchema,
} as const;

/** Routes behind `requireAuth`. 401 means "no valid session", 403 means "not yours". */
export const authErrors = {
  ...commonErrors,
  [STATUS_CODES.FORBIDDEN]: ForbiddenError.zodSchema.or(JWTError.zodSchema),
  [STATUS_CODES.UNAUTHORIZED]: UnauthorizedError.zodSchema.or(JWTError.zodSchema),
} as const;

/** Routes that resolve a record by id or slug. */
export const lookupErrors = {
  ...commonErrors,
  [STATUS_CODES.NOT_FOUND]: NotFoundError.zodSchema,
} as const;

export const authLookupErrors = {
  ...authErrors,
  [STATUS_CODES.NOT_FOUND]: NotFoundError.zodSchema,
} as const;

/** Sign-up and anything else that can collide on a unique column. */
export const conflictErrors = {
  ...commonErrors,
  [STATUS_CODES.CONFLICT]: ConflictError.zodSchema,
} as const;
