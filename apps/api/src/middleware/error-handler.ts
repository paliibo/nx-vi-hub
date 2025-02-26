import type { NextFunction, Request, Response } from "express";

import { STATUS_CODES } from "@/shared/constants";
import { getErrorInfo } from "@/shared/utils/error-info";

import { isProduction } from "../env";
import logger from "../utils/logger";

/**
 * Last-resort handler for anything a route threw instead of returning. The
 * message is only echoed back for 4xx; a 500 could carry a query string or a
 * connection URL, so clients get a fixed string and the detail goes to the log.
 */
export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const info = getErrorInfo(error);
  const status =
    info.statusCode >= 400 && info.statusCode <= 599 ? info.statusCode : STATUS_CODES.SERVER_ERROR;

  if (status >= 500) {
    logger.error(`${req.method} ${req.originalUrl} — ${info.message}`, { stack: info.stack });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} — ${status} ${info.message}`);
  }

  res.status(status).json({
    message: status >= 500 && isProduction ? "Something went wrong" : info.message,
    name: info.name,
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(STATUS_CODES.NOT_FOUND).json({
    message: `No route matches ${req.method} ${req.originalUrl}`,
    name: "NotFoundError",
  });
};
