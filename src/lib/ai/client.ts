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

/** Streams a cover letter from `/api/generate`, returning the full text. */
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
