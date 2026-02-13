const { createGlobPatternsForDependencies } = require("@nx/react/tailwind");
const { join } = require("path");

// PostCSS loads this file in plain Node before any TypeScript path alias
// exists, so the workspace theme can only be reached by relative path.
// eslint-disable-next-line @nx/enforce-module-boundaries
const { defaultConfig } = require("../../package/tailwind/src/tailwind.config");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...defaultConfig,
  content: [
    join(__dirname, "{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}"),
    // Picks up class names used inside package/shared-ui so its styles are not
    // purged out of the app's stylesheet.
    ...createGlobPatternsForDependencies(__dirname),
    join(__dirname, "../../package/shared-ui/src/**/*.{ts,tsx}"),
  ],
};
