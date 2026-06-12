//@ts-check
const { composePlugins, withNx } = require("@nx/next");
const { join } = require("path");

// Next only reads .env files next to the app. Loading the workspace root file
// here keeps configuration in one place for the API, Prisma and the web app.
require("dotenv").config({ path: join(__dirname, "../../.env"), quiet: true });

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4308",
  },
  // Emits a self-contained server with only the modules it actually imports,
  // which is what the Docker image runs.
  output: "standalone",
  // Traces from the workspace root rather than apps/web, so dependencies
  // hoisted to the root node_modules are included. Without it the standalone
  // server is missing styled-jsx and dies on boot.
  outputFileTracingRoot: join(__dirname, "../.."),
  reactStrictMode: true,
};

module.exports = composePlugins(withNx)(nextConfig);
