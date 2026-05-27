import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { buildMockLetter } from "@/lib/ai/mock";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/prompt";
import { getClientIp, rateLimit } from "@/lib/ai/rateLimit";
import { DETAILS_MAX_LENGTH, STRENGTHS_MAX_LENGTH } from "@/lib/constants";
import type { LetterInput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MOCK_TOKEN_DELAY_MS = 22;
/** Hard cap on request body (~8KB). Generous vs. the per-field limits below
 *  so JSON overhead never trips it, but small enough that nobody can ship
 *  multi-megabyte payloads at the OpenAI billing card. */
const MAX_BODY_BYTES = 8 * 1024;
const FIELD_LIMITS = {
  jobTitle: 200,
  company: 200,
  strengths: STRENGTHS_MAX_LENGTH,
  details: DETAILS_MAX_LENGTH,
} as const;

/** Plain-text stream; falls back to a deterministic mock when no API key. */
export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonError("Payload too large", 413);
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  if (!isValidInput(input)) {
    return jsonError("Job title and company are required", 400);
  }
  const tooLong = findTooLongField(input);
  if (tooLong) {
    return jsonError(`Field "${tooLong}" exceeds the allowed length`, 400);
  }

  const apiKey = process.env.OPENAI_API_KEY;

  // The mock path doesn't cost anything, so we skip the rate-limit for it —
  // otherwise the demo deploy without a key would 429 after 10 generations
  // and look broken. Only the real OpenAI path is gated.
  if (!apiKey) {
    return textStream(streamFromMock(input, request.signal), "mock");
  }

  const limit = rateLimit(getClientIp(request));
  if (!limit.allowed) {
    const retryAfter = Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000));
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    });
  }

  try {
    const stream = await streamFromOpenAI(input, apiKey, request.signal);
    return textStream(stream, "openai");
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      return jsonError(`OpenAI ${error.status ?? "error"}: ${error.message}`, error.status ?? 502);
    }
    if (error instanceof Error && error.name === "AbortError") {
      return new Response(null, { status: 499 });
    }
    return jsonError("Failed to reach the AI provider", 502);
  }
}

function isValidInput(value: unknown): value is LetterInput {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.jobTitle === "string" &&
    typeof v.company === "string" &&
    typeof v.strengths === "string" &&
    typeof v.details === "string" &&
    v.jobTitle.trim().length > 0 &&
    v.company.trim().length > 0
  );
}

/** Returns the name of the first field whose length exceeds its cap, or null. */
function findTooLongField(input: LetterInput): keyof LetterInput | null {
  for (const [key, max] of Object.entries(FIELD_LIMITS) as [keyof LetterInput, number][]) {
    if (input[key].length > max) return key;
  }
  return null;
}

function jsonError(error: string, status: number): Response {
  return Response.json({ error }, { status });
}

function textStream(body: ReadableStream<Uint8Array>, generator: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Generator": generator,
    },
  });
}

function streamFromMock(input: LetterInput, signal: AbortSignal): ReadableStream<Uint8Array> {
  const text = buildMockLetter(input);
  const tokens = text.match(/\S+\s*|\n+/g) ?? [text];
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for (const token of tokens) {
          if (signal.aborted) return;
          await sleep(MOCK_TOKEN_DELAY_MS);
          controller.enqueue(encoder.encode(token));
        }
      } finally {
        controller.close();
      }
    },
  });
}

async function streamFromOpenAI(
  input: LetterInput,
  apiKey: string,
  signal: AbortSignal,
): Promise<ReadableStream<Uint8Array>> {
  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const completion = await client.chat.completions.create(
    {
      model,
      stream: true,
      temperature: 0.7,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) },
      ],
    },
    { signal },
  );

  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const part of completion) {
          const delta = part.choices[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
      } finally {
        controller.close();
      }
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
