"use client";

import { Icon } from "@/components/ui/Icon";
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
  const isLoading = status === "loading";
  const isError = status === "error";

  return (
    <div className={styles.wrap} aria-live="polite">
      {isLoading ? (
        <div className={styles.loading} aria-label="Generating letter">
          <div className={styles.orb} role="presentation" />
        </div>
      ) : isError ? (
        <div className={styles.error} role="alert">
          <p>{errorMessage ?? "Something went wrong. Please try again."}</p>
        </div>
      ) : text ? (
        <div className={cx(styles.body, "scrollbarThin")}>{text}</div>
      ) : (
        <p className={styles.placeholder}>{PLACEHOLDER}</p>
      )}

      {!isLoading && !isError && (
        <div className={styles.footer}>
          <button
            type="button"
            onClick={() => copy(text)}
            disabled={!text}
            className={cx(styles.copyAction, copied && styles.copied)}
          >
            {copied ? "Copied!" : "Copy to clipboard"}
            <Icon name={copied ? "check" : "copy"} size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
