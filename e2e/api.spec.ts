import { test, expect } from "@playwright/test";
import { DETAILS_MAX_LENGTH } from "../src/lib/constants";

/**
 * End-to-end coverage for `/api/generate` request validation. Uses the
 * Playwright `request` fixture to hit the route without going through the
 * browser — this is the right layer to verify HTTP-level contracts (413,
 * 400, headers, streaming).
 *
 * Why 429 is not tested here: the dev server is started with
 * `OPENAI_API_KEY=""`, and the route applies the rate-limit only to the real
 * OpenAI path (mock stays uncapped on purpose, see Decision log). The 429
 * branch is exercised at the unit level in `tests/route.test.ts` where we
 * mock the SDK and can flip env per test. Bringing 429 into e2e would mean
 * either real OpenAI calls or test-only branches in production code — both
 * worse than the current setup.
 */

const VALID_INPUT = {
  jobTitle: "Engineer",
  company: "Stripe",
  strengths: "",
  details: "",
};

test.describe("POST /api/generate — validation contract", () => {
  test("rejects a body larger than the cap with 413", async ({ request }) => {
    const response = await request.post("/api/generate", {
      headers: { "Content-Type": "application/json" },
      // 10 KB of payload — server caps at ~8 KB via Content-Length.
      data: { ...VALID_INPUT, details: "x".repeat(10_000) },
    });
    expect(response.status()).toBe(413);
    expect(await response.json()).toEqual({ error: "Payload too large" });
  });

  test("rejects empty required fields with 400", async ({ request }) => {
    const response = await request.post("/api/generate", {
      data: { ...VALID_INPUT, jobTitle: "" },
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).error).toMatch(/required/i);
  });

  test("rejects per-field overflow with 400 naming the offending field", async ({ request }) => {
    // Just over the soft client cap; server enforces the same limit.
    // Stays under the 8 KB body cap so we hit the field check, not 413.
    const response = await request.post("/api/generate", {
      data: { ...VALID_INPUT, details: "a".repeat(DETAILS_MAX_LENGTH + 1) },
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).error).toMatch(/details/);
  });

  test("returns 400 on malformed JSON", async ({ request }) => {
    // Send raw bytes — Playwright's `data: <string>` JSON-encodes a plain
    // string, which would round-trip back to valid JSON server-side.
    const response = await request.post("/api/generate", {
      headers: { "Content-Type": "application/json" },
      data: Buffer.from("{not valid json", "utf-8"),
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).error).toMatch(/invalid json/i);
  });
});

test.describe("POST /api/generate — mock streaming path", () => {
  test("streams a plain-text mock letter when no API key is configured", async ({ request }) => {
    const response = await request.post("/api/generate", {
      data: VALID_INPUT,
    });
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/text\/plain/);
    expect(response.headers()["x-generator"]).toBe("mock");
    const body = await response.text();
    // Mock always opens with "Dear {Company} Team," — a stable contract.
    expect(body).toContain("Stripe");
  });
});
