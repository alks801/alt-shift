"use client";

import { CopyButton } from "@/components/ui/CopyButton";
import { cx } from "@/lib/cx";
import { markers } from "@/lib/markers";
import styles from "./LetterPreview.module.css";

export type PreviewStatus = "idle" | "loading" | "ready" | "error";

interface LetterPreviewProps {
  status: PreviewStatus;
  text: string;
  errorMessage?: string;
}

const PLACEHOLDER = "Your personalized job application will appear here…";
const DEFAULT_ERROR = "Something went wrong. Please try again.";
const m = markers.newLetter.preview;

export function LetterPreview({ status, text, errorMessage }: LetterPreviewProps) {
  const showFooter = status !== "loading" && status !== "error";

  return (
    <div className={styles.wrap} aria-busy={status === "loading"} {...m.nodeProps}>
      <PreviewContent status={status} text={text} errorMessage={errorMessage} />

      {/* Short, polite hint instead of reading the full letter aloud on ready. */}
      <span className="sr-only" aria-live="polite">
        {status === "ready" && text.length > 0 ? "Cover letter ready." : ""}
      </span>

      {showFooter && (
        <div className={styles.footer}>
          <CopyButton text={text} {...m.copyButton.nodeProps} />
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

function PreviewContent({ status, text, errorMessage }: PreviewContentProps) {
  if (status === "loading") {
    return (
      <div className={styles.loading} aria-label="Generating letter" {...m.loading.nodeProps}>
        <div className={styles.orb} role="presentation" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={styles.error} role="alert" {...m.error.nodeProps}>
        <p>{errorMessage ?? DEFAULT_ERROR}</p>
      </div>
    );
  }

  if (text) {
    return (
      <div className={cx(styles.body, "scrollbarThin")} {...m.body.nodeProps}>
        {text}
      </div>
    );
  }

  return (
    <p className={styles.placeholder} {...m.placeholder.nodeProps}>
      {PLACEHOLDER}
    </p>
  );
}
