"use client";

import { useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Title } from "@/components/ui/Title";
import { LetterForm } from "@/components/letters/LetterForm";
import { LetterPreview, type PreviewStatus } from "@/components/letters/LetterPreview";
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

/** Scroll-to-preview fires only when columns are stacked (≤ tablet). */
const STACKED_LAYOUT_QUERY = "(max-width: 960px)";

export default function NewLetterPage() {
  const { letters, createLetter, updateLetterBody } = useLettersContext();
  const [values, setValues] = useState<LetterInput>(EMPTY_FORM);
  const [status, setStatus] = useState<PreviewStatus>("idle");
  const [preview, setPreview] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const sessionLetterIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const handleCreateNew = () => {
    abortRef.current?.abort();
    setValues(EMPTY_FORM);
    setStatus("idle");
    setPreview("");
    setErrorMessage(undefined);
    sessionLetterIdRef.current = null;
  };

  const handleGenerate = async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setPreview("");
    setErrorMessage(undefined);

    if (
      typeof window !== "undefined" &&
      window.matchMedia(STACKED_LAYOUT_QUERY).matches &&
      previewRef.current
    ) {
      previewRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    try {
      const finalText = await generateCoverLetter(values, {
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;

      const trimmed = finalText.trim();
      if (trimmed.length === 0) {
        setStatus("idle");
        return;
      }

      // First generation → create; "Try Again" → overwrite (avoids draft flood).
      // If the session letter was deleted (e.g. from another tab), fall back
      // to create so "Try Again" doesn't silently no-op against a stale id.
      const sessionId = sessionLetterIdRef.current;
      const sessionLetterExists = sessionId !== null && letters.some((l) => l.id === sessionId);

      if (sessionId && sessionLetterExists) {
        updateLetterBody(sessionId, trimmed);
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
              <div ref={previewRef} className={styles.previewColumn}>
                <LetterPreview status={status} text={preview} errorMessage={errorMessage} />
              </div>
            </div>

            {showBanner && (
              <div className={styles.bannerWrap}>
                <GoalBanner count={count} variant="general" onCreateNew={handleCreateNew} />
              </div>
            )}
          </div>
        </PageContainer>
      </main>
    </>
  );
}

function buildHeading(values: LetterInput): React.ReactNode {
  const parts = [values.jobTitle, values.company].map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) {
    return <span className={styles.titleMuted}>New application</span>;
  }
  return parts.join(", ");
}
