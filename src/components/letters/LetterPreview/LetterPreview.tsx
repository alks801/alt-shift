"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { IconAction } from "@/components/ui/IconAction";
import { useCopyToClipboard } from "@/lib/hooks/useCopyToClipboard";
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
 * Right-hand preview pane.
 *
 * States:
 *   idle    — placeholder copy + disabled "Copy" affordance.
 *   loading — floating brand orb, no body text (we intentionally don't
 *             reveal partial output mid-generation; cleaner UX, no flicker).
 *   ready   — full letter + active "Copy" button.
 *   error   — alert with retry hint.
 */
export function LetterPreview({ status, text, errorMessage }: LetterPreviewProps) {
  const { copied, copy } = useCopyToClipboard();
  const showFooter = status !== "loading" && status !== "error";

  return (
    <div className={styles.wrap} aria-live="polite">
      {renderBody(status, text, errorMessage)}

      {showFooter && (
        <div className={styles.footer}>
          <IconAction
            onClick={() => copy(text)}
            disabled={!text}
            tone={copied ? "success" : "neutral"}
            trailingIcon={<Icon name={copied ? "check" : "copy"} size={20} />}
          >
            {copied ? "Copied!" : "Copy to clipboard"}
          </IconAction>
        </div>
      )}
    </div>
  );
}

function renderBody(
  status: PreviewStatus,
  text: string,
  errorMessage: string | undefined,
): ReactNode {
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
