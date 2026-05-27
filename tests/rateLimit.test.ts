import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetForTests, getClientIp, rateLimit } from "@/lib/ai/rateLimit";

beforeEach(() => {
  __resetForTests();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("rateLimit", () => {
  it("allows the first 10 requests, blocks the 11th", () => {
    for (let i = 0; i < 10; i++) {
      expect(rateLimit("1.1.1.1").allowed, `request ${i + 1}`).toBe(true);
    }
    expect(rateLimit("1.1.1.1").allowed).toBe(false);
  });

  it("returns a future resetAt that survives across allowed calls", () => {
    const first = rateLimit("1.1.1.1");
    const last = rateLimit("1.1.1.1");
    expect(first.resetAt).toBe(last.resetAt);
    expect(first.resetAt).toBeGreaterThan(Date.now());
  });

  it("isolates buckets per IP", () => {
    for (let i = 0; i < 10; i++) rateLimit("1.1.1.1");
    expect(rateLimit("1.1.1.1").allowed).toBe(false);
    // Different IP must still have a full bucket.
    expect(rateLimit("2.2.2.2").allowed).toBe(true);
  });

  it("refills after the window expires", () => {
    for (let i = 0; i < 10; i++) rateLimit("1.1.1.1");
    expect(rateLimit("1.1.1.1").allowed).toBe(false);

    // Advance past the 60s window — bucket should reset.
    vi.advanceTimersByTime(60_001);
    expect(rateLimit("1.1.1.1").allowed).toBe(true);
  });

  it("does not refill before the window expires", () => {
    for (let i = 0; i < 10; i++) rateLimit("1.1.1.1");
    vi.advanceTimersByTime(59_000);
    expect(rateLimit("1.1.1.1").allowed).toBe(false);
  });
});

describe("getClientIp", () => {
  function makeReq(headers: Record<string, string>): never {
    // We only use `.headers.get(...)`, so a partial shape is enough.
    return {
      headers: {
        get: (key: string) => headers[key.toLowerCase()] ?? null,
      },
    } as never;
  }

  it("returns the first IP from x-forwarded-for", () => {
    const req = makeReq({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" });
    expect(getClientIp(req)).toBe("1.1.1.1");
  });

  it("trims surrounding whitespace from the first IP", () => {
    const req = makeReq({ "x-forwarded-for": "  3.3.3.3 , 4.4.4.4" });
    expect(getClientIp(req)).toBe("3.3.3.3");
  });

  it("falls back to x-real-ip when x-forwarded-for is missing", () => {
    const req = makeReq({ "x-real-ip": "5.5.5.5" });
    expect(getClientIp(req)).toBe("5.5.5.5");
  });

  it("returns the anonymous sentinel when no header is set", () => {
    const req = makeReq({});
    expect(getClientIp(req)).toBe("anonymous");
  });
});
