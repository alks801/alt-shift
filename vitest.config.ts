import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/app/**", "src/**/index.ts", "src/**/*.d.ts", "src/lib/types.ts"],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./tests/setup.ts"],
          include: ["tests/**/*.test.{ts,tsx}"],
          css: {
            modules: {
              classNameStrategy: "non-scoped",
            },
          },
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(__dirname, ".storybook") })],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
