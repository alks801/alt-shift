"use client";

import { useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Title } from "@/components/ui/Title";
import { LetterForm } from "@/components/letters/LetterForm";
import {
  LetterPreview,
  type PreviewStatus,
} from "@/components/letters/LetterPreview";
import { GoalBanner } from "@/components/letters/GoalBanner";
import { useLettersContext } from "@/lib/letters/LettersContext";
import { generateCoverLetter, GenerationError } from "@/lib/ai/client";
import { GOAL_LETTERS } from "@/lib/constants";
import type { LetterInput } from "@/lib/types";
import styles from "./page.module.css";

const EMPTY_FORM: LetterInput = {
  jobTitle: "",
  company: "",
  strengths: "",
  details: "",
};

export default function NewLetterPage() {
  const { letters, createLetter, updateLetterBody } = useLettersContext();
  const [values, setValues] = useState<LetterInput>(EMPTY_FORM);
  const [status, setStatus] = useState<PreviewStatus>("idle");
  const [preview, setPreview] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const sessionLetterIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const handleCreateNew = () => {
    abortRef.current?.abort();
    setValues(EMPTY_FORM);
    setStatus("idle");
    setPreview("");
    setErrorMessage(undefined);
    // Reset the session ref so the next generation creates a fresh letter
    // (instead of overwriting the previous one via `updateLetterBody`).
    sessionLetterIdRef.current = null;
  };

  const handleGenerate = async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setPreview("");
    setErrorMessage(undefined);

    try {
      // No `onChunk` — we wait for the full letter to keep the loading state
      // visually calm (floating orb). Showing partial output here was noisy
      // and added little value once the orb animation was in place.
      const finalText = await generateCoverLetter(values, {
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;

      const trimmed = finalText.trim();
      if (trimmed.length === 0) {
        setStatus("idle");
        return;
      }

      // First successful generation in this session creates a new letter.
      // Subsequent "Try Again" presses overwrite the same letter so the
      // dashboard doesn't fill up with discarded drafts.
      if (sessionLetterIdRef.current) {
        updateLetterBody(sessionLetterIdRef.current, trimmed);
      } else {
        const letter = createLetter({
          jobTitle: values.jobTitle.trim(),
          company: values.company.trim(),
          body: trimmed,
        });
        sessionLetterIdRef.current = letter.id;
      }

      setPreview(trimmed);
      setStatus("ready");
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      const message =
        error instanceof GenerationError
          ? error.message
          : "Something went wrong while generating the letter.";
      setErrorMessage(message);
      setStatus("error");
    }
  };

  const heading = buildHeading(values);
  const count = letters.length;
  // Banner only appears after a successful generation in this session,
  // not just because there are pre-existing letters in storage.
  const showBanner = status === "ready" && count < GOAL_LETTERS;

  return (
    <>
      <AppHeader generatedCount={count} />
      <main>
        <PageContainer>
          <div className={styles.page}>
            <div className={styles.layout}>
              <div className={styles.formColumn}>
                <Title className={styles.title}>{heading}</Title>
                <LetterForm
                  values={values}
                  onChange={setValues}
                  onSubmit={handleGenerate}
                  status={status}
                />
              </div>
              <LetterPreview
                status={status}
                text={preview}
                errorMessage={errorMessage}
              />
            </div>

            {showBanner && (
              <div className={styles.bannerWrap}>
                <GoalBanner
                  count={count}
                  variant="general"
                  onCreateNew={handleCreateNew}
                />
              </div>
            )}
          </div>
        </PageContainer>
      </main>
    </>
  );
}

function buildHeading(values: LetterInput): React.ReactNode {
  const parts = [values.jobTitle, values.company]
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) {
    return <span className={styles.titleMuted}>New application</span>;
  }
  return parts.join(", ");
}
