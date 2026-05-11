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
  output: "standalone",
  reactStrictMode: true,
};

module.exports = composePlugins(withNx)(nextConfig);
