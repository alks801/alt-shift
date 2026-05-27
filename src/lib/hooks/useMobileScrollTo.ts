"use client";

import { useEffect, type RefObject } from "react";

const MOBILE_QUERY = "(max-width: 960px)";

/**
 * On stacked layouts (≤ tablet), scroll `ref` into view when `predicate()`
 * flips to `true`. The predicate is re-evaluated on every render; the effect
 * fires only when its result changes, so passing a fresh arrow function each
 * render (`() => status === "ready"`) is safe and idiomatic.
 */
export function useMobileScrollTo(
  ref: RefObject<HTMLElement | null>,
  predicate: () => boolean,
): void {
  const shouldScroll = predicate();

  useEffect(() => {
    if (!shouldScroll) return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia(MOBILE_QUERY).matches) return;
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [ref, shouldScroll]);
}
