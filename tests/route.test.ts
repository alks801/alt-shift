import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DETAILS_MAX_LENGTH } from "@/lib/constants";

/**
 * `openai` SDK is mocked so we can drive the route's branches deterministically
 * (success stream / APIError / AbortError) without hitting the network.
 *
 * `vi.hoisted` keeps `mockCreate` defined before `vi.mock` runs, which is the
 * only way to share a spy between the mock factory and the test body.
 */
const { mockCreate } = vi.hoisted(() => ({ mockCreate: vi.fn() }));

vi.mock("openai", () => {
  class APIError extends Error {
    public readonly status?: number;
    constructor(message: string, status?: number) {
      super(message);
      this.name = "APIError";
      this.status = status;
    }
  }
  class OpenAI {
    chat = { completions: { create: mockCreate } };
    static APIError = APIError;
  }
  return { default: OpenAI };
});

import { __resetForTests } from "@/lib/ai/rateLimit";
import { POST } from "@/app/api/generate/route";

function makeRequest(
  body: unknown,
  {
    headers = {},
    contentLength,
  }: { headers?: Record<string, string>; contentLength?: number } = {},
): Request {
  const payload = JSON.stringify(body);
  const encoded = new TextEncoder().encode(payload);
  return new Request("http://localhost/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": String(contentLength ?? encoded.byteLength),
      "x-forwarded-for": "10.0.0.1",
      ...headers,
    },
    body: payload,
  });
}

const VALID_INPUT = {
  jobTitle: "Engineer",
  company: "Stripe",
  strengths: "",
  details: "",
};

async function readBody(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let out = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    out += decoder.decode(value, { stream: true });
  }
  return out;
}

/** Builds an async-iterable that mimics an OpenAI chat completion stream. */
function makeOpenAIStream(chunks: string[]) {
  return {
    async *[Symbol.asyncIterator]() {
      for (const content of chunks) yield { choices: [{ delta: { content } }] };
    },
  };
}

beforeEach(() => {
  __resetForTests();
  mockCreate.mockReset();
  delete process.env.OPENAI_API_KEY;
});

afterEach(() => {
  delete process.env.OPENAI_API_KEY;
});

describe("POST /api/generate — validation", () => {
  it("rejects bodies larger than the cap with 413", async () => {
    const response = await POST(makeRequest(VALID_INPUT, { contentLength: 1_000_000 }) as never);
    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: "Payload too large" });
  });

  it("rejects unparseable JSON with 400", async () => {
    const request = new Request("http://localhost/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": "5" },
      body: "{not json",
    });
    const response = await POST(request as never);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid JSON body" });
  });

  it("rejects missing required fields with 400", async () => {
    const response = await POST(makeRequest({ ...VALID_INPUT, jobTitle: "" }) as never);
    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/required/i);
  });

  it("rejects fields exceeding their per-field length with 400", async () => {
    const response = await POST(
      makeRequest({ ...VALID_INPUT, details: "a".repeat(DETAILS_MAX_LENGTH + 1) }) as never,
    );
    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/details/);
  });
});

describe("POST /api/generate — mock path", () => {
  it("streams a mock letter when no API key is configured", async () => {
    const response = await POST(makeRequest(VALID_INPUT) as never);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toMatch(/text\/plain/);
    expect(response.headers.get("X-Generator")).toBe("mock");
    const body = await readBody(response);
    expect(body).toContain("Dear Stripe Team");
  });

  it("does not call OpenAI in the mock path", async () => {
    await POST(makeRequest(VALID_INPUT) as never);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("ignores the rate-limit in the mock path", async () => {
    // 11 requests would 429 on the real path, but mock must stay uncapped.
    for (let i = 0; i < 11; i++) {
      const response = await POST(makeRequest(VALID_INPUT) as never);
      expect(response.status).toBe(200);
    }
  });
});

describe("POST /api/generate — OpenAI path", () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = "sk-test-key";
  });

  it("streams the assembled OpenAI deltas as plain text", async () => {
    mockCreate.mockResolvedValueOnce(makeOpenAIStream(["Hello ", "world."]));
    const response = await POST(makeRequest(VALID_INPUT) as never);
    expect(response.status).toBe(200);
    expect(response.headers.get("X-Generator")).toBe("openai");
    expect(await readBody(response)).toBe("Hello world.");
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it("returns 429 + Retry-After once the bucket is exhausted", async () => {
    mockCreate.mockResolvedValue(makeOpenAIStream(["hi"]));
    for (let i = 0; i < 10; i++) {
      const ok = await POST(makeRequest(VALID_INPUT) as never);
      expect(ok.status).toBe(200);
      // Drain the stream so the next request can run cleanly.
      await readBody(ok);
    }
    const blocked = await POST(makeRequest(VALID_INPUT) as never);
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect((await blocked.json()).error).toMatch(/too many/i);
  });

  it("propagates OpenAI APIError with its original status", async () => {
    const OpenAI = (await import("openai")).default;
    // Cast around the real SDK's 4-arg constructor — our mock takes (message, status).
    const ApiError = OpenAI.APIError as unknown as new (message: string, status?: number) => Error;
    mockCreate.mockRejectedValueOnce(new ApiError("model overloaded", 503));
    const response = await POST(makeRequest(VALID_INPUT) as never);
    expect(response.status).toBe(503);
    expect((await response.json()).error).toMatch(/503/);
  });

  it("returns 499 when the request is aborted upstream", async () => {
    const abortError = Object.assign(new Error("aborted"), { name: "AbortError" });
    mockCreate.mockRejectedValueOnce(abortError);
    const response = await POST(makeRequest(VALID_INPUT) as never);
    expect(response.status).toBe(499);
  });

  it("returns 502 on generic unknown failures", async () => {
    mockCreate.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const response = await POST(makeRequest(VALID_INPUT) as never);
    expect(response.status).toBe(502);
    expect((await response.json()).error).toMatch(/AI provider/i);
  });
});
