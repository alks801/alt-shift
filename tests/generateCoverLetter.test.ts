import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateCoverLetter, GenerationError } from "@/lib/ai/client";

const INPUT = {
  jobTitle: "Engineer",
  company: "Anthropic",
  strengths: "",
  details: "",
};

describe("generateCoverLetter — 30s timeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("aborts and surfaces a clear error after 30s of silence", async () => {
    // Fetch that hangs but respects the abort signal — mimics a stalled upstream.
    vi.stubGlobal(
      "fetch",
      (_url: string, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("aborted", "AbortError"));
          });
        }),
    );

    // Attach the catch synchronously — fake timers fire the rejection
    // during `advanceTimersByTimeAsync`, before any later `await` could
    // observe it. Without this, Vitest reports an unhandled rejection.
    const pending = generateCoverLetter(INPUT);
    const settled = pending.catch((e: unknown) => e);

    await vi.advanceTimersByTimeAsync(30_000);

    const error = await settled;
    expect(error).toBeInstanceOf(GenerationError);
    expect((error as GenerationError).message).toMatch(/timed out/i);
  });
});
