import { STORAGE_KEY } from "../constants";
import type { Letter } from "../types";

/**
 * Versioned localStorage adapter.
 *
 * The storage key encodes the schema version (`:v1`). If we ever need to
 * migrate, bump the key and add a one-shot migration here that reads the
 * old key, transforms the payload, and writes the new one. Old keys can be
 * cleaned up after a grace period.
 */

interface StoredEnvelope {
  version: 1;
  letters: Letter[];
}

const isBrowser = () => typeof window !== "undefined";

function isLetter(value: unknown): value is Letter {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.jobTitle === "string" &&
    typeof v.company === "string" &&
    typeof v.body === "string" &&
    typeof v.createdAt === "number" &&
    typeof v.updatedAt === "number"
  );
}

export function loadLetters(): Letter[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<StoredEnvelope> | null;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.letters)) {
      return [];
    }
    return parsed.letters.filter(isLetter);
  } catch {
    // Corrupted payload — surface as empty rather than crash the dashboard.
    return [];
  }
}

export function saveLetters(letters: Letter[]): void {
  if (!isBrowser()) return;
  const envelope: StoredEnvelope = { version: 1, letters };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // Quota or private-mode error — silently ignore. The in-memory list keeps
    // working for the session; we don't want to break the UX.
  }
}
