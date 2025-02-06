import { createLogger, format, transports } from "winston";

import { env, isProduction, isTest } from "../env";

const { colorize, combine, errors, json, printf, timestamp } = format;

const humanFormat = printf(({ level, message, stack, timestamp: at }) =>
  stack ? `${at} ${level}: ${message}\n${stack}` : `${at} ${level}: ${message}`,
);

/**
 * Structured JSON in production so a log shipper can index it; colourised
 * single lines in development so it is readable in a terminal. Nothing is
 * written to disk — the previous file transport committed app.log into the
 * repository, and containers are expected to log to stdout anyway.
 */
export const logger = createLogger({
  format: isProduction
    ? combine(timestamp(), errors({ stack: true }), json())
    : combine(colorize(), timestamp({ format: "HH:mm:ss" }), errors({ stack: true }), humanFormat),
  level: isProduction ? "info" : "debug",
  silent: isTest,
  transports: [new transports.Console()],
});

export const logStartup = (port: number) => {
  logger.info(`Vi Hub API listening on http://localhost:${port}`);
  logger.info(`  OpenAPI  http://localhost:${port}/api-docs`);
  logger.info(`  Health   http://localhost:${port}/health`);
  logger.info(`  Origin   ${env.WEB_ORIGIN}`);
};

export default logger;
