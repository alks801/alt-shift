import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { buildMockLetter } from "@/lib/ai/mock";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/prompt";
import type { LetterInput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MOCK_TOKEN_DELAY_MS = 22;

/**
 * Cover-letter generation endpoint.
 *
 * Streams plain text chunks (no SSE framing) so the client can simply read
 * the response body and append. When `OPENAI_API_KEY` is missing, the route
 * returns the same plain-text stream from a deterministic mock so the demo
 * is usable out of the box. Hard failures (bad input, model unreachable)
 * are returned as JSON so the client can surface them in the UI.
 */
export async function POST(request: NextRequest) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  if (!isValidInput(input)) {
    return jsonError("Job title and company are required", 400);
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return textStream(streamFromMock(input, request.signal), "mock");
  }

  try {
    const stream = await streamFromOpenAI(input, apiKey, request.signal);
    return textStream(stream, "openai");
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      return jsonError(
        `OpenAI ${error.status ?? "error"}: ${error.message}`,
        error.status ?? 502,
      );
    }
    if ((error as Error)?.name === "AbortError") {
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

/** Stream the mock letter token-by-token to mimic a real model's latency. */
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

  // Awaiting create() surfaces auth/quota/network errors before we start the
  // response stream, so we can still return a proper JSON status to the UI.
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
