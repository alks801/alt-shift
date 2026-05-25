import type { ReactNode } from "react";

/**
 * Compute the `aria-describedby` value for a Field control. Error takes
 * precedence over hint; returns `undefined` when neither is present so we
 * don't emit an empty attribute that screen readers may chase to nowhere.
 */
export function describedBy(
  id: string,
  error: ReactNode,
  hint: ReactNode,
): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}
