import type { LetterInput } from "../types";

export class GenerationError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "GenerationError";
  }
}

interface GenerateOptions {
  signal?: AbortSignal;
  /** Called once for every text chunk arriving from the server. */
  onChunk?: (chunk: string) => void;
}

/**
 * Generate a cover letter via the server route.
 *
 * Returns the final concatenated text; chunks are pushed to `onChunk` as
 * they arrive so the UI can render progressively. Aborting the signal
 * resolves with the partial text accumulated so far (or throws AbortError
 * via `fetch` — callers should treat both as "cancelled").
 *
 * The function never silently swaps in a different generator on failure —
 * errors are surfaced to the caller as `GenerationError` so the UI can
 * present a clear retry affordance.
 */
export async function generateCoverLetter(
  input: LetterInput,
  { signal, onChunk }: GenerateOptions = {},
): Promise<string> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal,
  });

  if (!response.ok || !response.body) {
    const message = await readErrorMessage(response);
    throw new GenerationError(message, response.status);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      onChunk?.(chunk);
    }
  } finally {
    reader.releaseLock();
  }

  return buffer;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string } | null;
    if (data && typeof data.error === "string") return data.error;
  } catch {
    // Body was not JSON — fall through to the generic message.
  }
  return `Generation failed (HTTP ${response.status})`;
}
