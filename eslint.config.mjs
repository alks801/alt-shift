// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import prettierConfig from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "next-env.d.ts",
      "node_modules/**",
      "coverage/**",
      "e2e/**",
      "playwright-report/**",
      "test-results/**",
      "storybook-static/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
    },
  }, // Must be last: turns off ESLint rules that would conflict with Prettier
  // so the two tools have non-overlapping responsibilities (Prettier owns
  // formatting, ESLint owns code quality).
  prettierConfig,
  ...storybook.configs["flat/recommended"],
];

export default eslintConfig;
