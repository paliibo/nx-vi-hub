const { readFileSync } = require("fs");
const { join } = require("path");

const WORKSPACE_ROOT = __dirname;

/**
 * Shared Jest configuration.
 *
 * Module aliases are derived from tsconfig.base.json rather than restated here,
 * so adding a path alias to the workspace is enough for tests to resolve it —
 * there is no second list to keep in step. Targets are resolved to absolute
 * paths so every project gets the same mapping regardless of how deeply it is
 * nested.
 */
const stripJsonComments = (text) =>
  text.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (match, comment) =>
    comment ? "" : match,
  );

const { compilerOptions } = JSON.parse(
  stripJsonComments(readFileSync(join(WORKSPACE_ROOT, "tsconfig.base.json"), "utf8")),
);

const moduleNameMapper = Object.fromEntries(
  Object.entries(compilerOptions.paths).map(([alias, [target]]) => {
    // Wildcard aliases capture the remainder; exact aliases are anchored, or
    // "@nx-vi-hub/db" would also swallow "@nx-vi-hub/db/server".
    const pattern = alias.includes("/*")
      ? `^${alias.replace("/*", "/(.*)$")}`
      : `^${alias}$`;
    return [pattern, join(WORKSPACE_ROOT, target.replace("/*", "/$1"))];
  }),
);

module.exports = {
  clearMocks: true,
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  moduleNameMapper,
  testEnvironment: "node",
  transform: { "^.+\\.[tj]sx?$": ["@swc/jest"] },
};
