"use client";

import { CopyButton } from "@/components/ui/CopyButton";
import { cx } from "@/lib/cx";
import styles from "./LetterPreview.module.css";

export type PreviewStatus = "idle" | "loading" | "ready" | "error";

interface LetterPreviewProps {
  status: PreviewStatus;
  text: string;
  errorMessage?: string;
}

const PLACEHOLDER = "Your personalized job application will appear here…";
const DEFAULT_ERROR = "Something went wrong. Please try again.";

/**
 * Right-hand preview pane. Owns the visual chrome (wrap, footer, live
 * region) and delegates the state-driven content area to `PreviewContent`.
 */
export function LetterPreview({ status, text, errorMessage }: LetterPreviewProps) {
  const showFooter = status !== "loading" && status !== "error";

  return (
    <div className={styles.wrap} aria-live="polite">
      <PreviewContent status={status} text={text} errorMessage={errorMessage} />

      {showFooter && (
        <div className={styles.footer}>
          <CopyButton text={text} />
        </div>
      )}
    </div>
  );
}

interface PreviewContentProps {
  status: PreviewStatus;
  text: string;
  errorMessage?: string;
}

/**
 * State-driven content area inside `LetterPreview`. Kept as a separate
 * component (rather than inline ternaries) so each state is read like a
 * dedicated little screen:
 *   - loading → floating brand orb (no partial text — calmer UX, no flicker).
 *   - error   → alert with retry hint.
 *   - ready   → full letter, scrollable.
 *   - idle    → placeholder copy.
 */
function PreviewContent({ status, text, errorMessage }: PreviewContentProps) {
  if (status === "loading") {
    return (
      <div className={styles.loading} aria-label="Generating letter">
        <div className={styles.orb} role="presentation" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={styles.error} role="alert">
        <p>{errorMessage ?? DEFAULT_ERROR}</p>
      </div>
    );
  }

  if (text) {
    return <div className={cx(styles.body, "scrollbarThin")}>{text}</div>;
  }

  return <p className={styles.placeholder}>{PLACEHOLDER}</p>;
}
