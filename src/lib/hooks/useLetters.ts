"use client";

import { useCallback, useEffect, useState } from "react";
import { loadLetters, saveLetters } from "@/lib/storage/letters";
import type { Letter } from "@/lib/types";

export interface NewLetterInput {
  jobTitle: string;
  company: string;
  body: string;
}

export interface LettersApi {
  letters: Letter[];
  hydrated: boolean;
  createLetter: (input: NewLetterInput) => Letter;
  updateLetterBody: (id: string, body: string) => void;
  deleteLetter: (id: string) => void;
}

/**
 * Single source of truth for the user's letters during a session.
 *
 * Hydrates from `localStorage` on mount and persists every mutation.
 * `hydrated` flips to true once the browser-side state has been loaded so
 * consumers can avoid flashing an "empty" UI before hydration completes.
 *
 * Persistence is gated on the `hydrated` flag inside the effect's deps so
 * the initial render never overwrites stored data with the placeholder `[]`.
 */
export function useLetters(): LettersApi {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLetters(loadLetters());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveLetters(letters);
  }, [letters, hydrated]);

  const createLetter = useCallback((input: NewLetterInput): Letter => {
    const now = Date.now();
    const letter: Letter = {
      id: crypto.randomUUID(),
      jobTitle: input.jobTitle,
      company: input.company,
      body: input.body,
      createdAt: now,
      updatedAt: now,
    };
    setLetters((prev) => [letter, ...prev]);
    return letter;
  }, []);

  const updateLetterBody = useCallback((id: string, body: string) => {
    setLetters((prev) =>
      prev.map((l) => (l.id === id ? { ...l, body, updatedAt: Date.now() } : l)),
    );
  }, []);

  const deleteLetter = useCallback((id: string) => {
    setLetters((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return { letters, hydrated, createLetter, updateLetterBody, deleteLetter };
}
