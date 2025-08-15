import { createExpressEndpoints } from "@ts-rest/express";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import { join } from "path";
import swaggerUi from "swagger-ui-express";

import { webContract } from "@/shared/api";

import { env, isProduction } from "./env";
import { attachUser } from "./middleware/auth";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { openApiDocument } from "./openapi";
import { appRouter } from "./routers";

/**
 * Builds the Express app without listening, so tests can drive it in-process
 * and the entry point stays a three-line bootstrap.
 */
export const createApp = (): Express => {
  const app = express();

  app.disable("x-powered-by");

  app.use(
    cors({
      // Credentials cannot be sent to a wildcard origin, and the whole auth
      // scheme depends on the browser attaching cookies.
      credentials: true,
      origin: env.WEB_ORIGIN,
    }),
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use("/assets", express.static(join(__dirname, "assets")));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: Math.round(process.uptime()) });
  });

  app.get("/openapi.json", (_req, res) => {
    res.json(openApiDocument);
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  createExpressEndpoints(webContract, appRouter, app, {
    // Runs before every route so public endpoints still know who is asking.
    globalMiddleware: [attachUser],
    requestValidationErrorHandler: "combined",
    // Catching a malformed response in development is worth the cost; in
    // production it would double the serialisation work on every request.
    responseValidation: !isProduction,
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
