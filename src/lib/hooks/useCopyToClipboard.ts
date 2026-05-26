"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseCopyToClipboardApi {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
}

/**
 * Copy a string to the clipboard with a transient "copied" flag the UI can
 * use for a quick acknowledgement. Resets after `resetMs` (default 1.8 s).
 */
export function useCopyToClipboard(resetMs = 1800): UseCopyToClipboardApi {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), resetMs);
        return true;
      } catch {
        return false;
      }
    },
    [resetMs],
  );

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return { copied, copy };
}
