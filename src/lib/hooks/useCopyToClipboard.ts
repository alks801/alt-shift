"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseCopyToClipboardApi {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
}

/**
 * Copy a string to the clipboard with a transient "copied" flag the UI can
 * use for a quick acknowledgement. Falls back to `document.execCommand` when
 * `navigator.clipboard` isn't available (older browsers, insecure contexts).
 */
export function useCopyToClipboard(resetMs = 1800): UseCopyToClipboardApi {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (text: string) => {
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          legacyCopy(text);
        }
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

function legacyCopy(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
