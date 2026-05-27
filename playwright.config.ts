import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3001",
    headless: true,
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: "npm run dev -- --port 3001",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    /* Force the mock generator regardless of what's in .env / .env.local.
       Next.js only fills env vars from .env files when they aren't already
       set in process.env, so exporting an empty value here wins.
       Passed via `env:` (not a shell prefix) so this works on Windows too. */
    env: { OPENAI_API_KEY: "" },
  },
});
