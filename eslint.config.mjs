import js from "@eslint/js";
import nx from "@nx/eslint-plugin";
import perfectionist from "eslint-plugin-perfectionist";
import unusedImports from "eslint-plugin-unused-imports";

/**
 * Flat config for the workspace.
 *
 * perfectionist is applied through its own flat preset rather than through
 * FlatCompat: `plugin:perfectionist/recommended-natural` is an eslintrc-shaped
 * config, and v5 exposes `plugins` as an object, which the compat layer rejects
 * because eslintrc expects an array there.
 */
export default [
  js.configs.recommended,
  ...nx.configs["flat/base"],
  ...nx.configs["flat/typescript"],
  ...nx.configs["flat/javascript"],
  perfectionist.configs["recommended-natural"],
  {
    plugins: { "unused-imports": unusedImports },
    rules: {
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { args: "after-used", argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          allow: [],
          depConstraints: [{ onlyDependOnLibsWithTags: ["*"], sourceTag: "*" }],
          enforceBuildableLibDependency: true,
        },
      ],
    },
  },
  {
    // Generated Prisma output, build artefacts, and tsconfig files — the last
    // of these are JSONC, which the TypeScript parser reads as JavaScript and
    // rejects on the first unquoted-looking token.
    ignores: [
      "**/tsconfig*.json",
      "**/dist",
      "**/.next",
      "**/build",
      "**/dev-dist",
      "**/.history",
      "**/node_modules",
      "**/*.timestamp*",
      "package/db/prisma/migrations",
    ],
  },
];
