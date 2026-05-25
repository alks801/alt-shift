"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useLetters, type LettersApi } from "@/lib/hooks/useLetters";

const LettersContext = createContext<LettersApi | null>(null);

/**
 * App-wide letters provider. Mounting at the root layout gives every page
 * a single, consistent letters store and a single `localStorage` hydration
 * (so the dashboard and the form don't each re-hydrate and risk diverging).
 */
export function LettersProvider({ children }: { children: ReactNode }) {
  const api = useLetters();
  return <LettersContext.Provider value={api}>{children}</LettersContext.Provider>;
}

export function useLettersContext(): LettersApi {
  const value = useContext(LettersContext);
  if (!value) {
    throw new Error("useLettersContext must be used inside <LettersProvider>");
  }
  return value;
}
