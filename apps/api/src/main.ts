import { createApp } from "./app";
import { env } from "./env";
import logger, { logStartup } from "./utils/logger";

const app = createApp();

const server = app.listen(env.PORT, () => logStartup(env.PORT));

// Containers stop with SIGTERM; without this the process is killed mid-request
// and in-flight responses are dropped rather than finished.
const shutdown = (signal: string) => () => {
  logger.info(`${signal} received, shutting down`);
  server.close(() => process.exit(0));
};

process.on("SIGTERM", shutdown("SIGTERM"));
process.on("SIGINT", shutdown("SIGINT"));
