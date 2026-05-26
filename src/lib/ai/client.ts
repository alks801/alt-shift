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
}

const GENERATION_TIMEOUT_MS = 30_000;

/** Streams a cover letter from `/api/generate`, returning the full text. */
export async function generateCoverLetter(
  input: LetterInput,
  { signal }: GenerateOptions = {},
): Promise<string> {
  const controller = new AbortController();

  // Abort on caller's signal (user navigated away, component unmounted).
  signal?.addEventListener("abort", () => controller.abort(signal.reason), { once: true });

  // Abort after 30s so the UI never hangs on a stalled upstream.
  const timer = setTimeout(() => controller.abort("timeout"), GENERATION_TIMEOUT_MS);

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
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
        buffer += decoder.decode(value, { stream: true });
      }
    } finally {
      reader.releaseLock();
    }

    return buffer;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      if (controller.signal.reason === "timeout") {
        throw new GenerationError("Generation timed out — please try again.");
      }
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
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
