"use client";

import { AlertCircle, Check, Copy } from "lucide-react";
import { useCopyToClipboard } from "@/lib/hooks/useCopyToClipboard";
import { cx } from "@/lib/cx";
import styles from "./LetterPreview.module.css";

export type PreviewStatus = "idle" | "loading" | "ready" | "error";

interface LetterPreviewProps {
  status: PreviewStatus;
  text: string;
  errorMessage?: string;
}

export function LetterPreview({ status, text, errorMessage }: LetterPreviewProps) {
  const { copied, copy } = useCopyToClipboard();
  const isStreaming = status === "loading" && text.length > 0;
  const hasBody = status === "ready" || isStreaming;

  return (
    <div className={styles.wrap} aria-live="polite">
      {status === "idle" && (
        <div className={styles.idle}>
          <p>Fill in the form and click Generate — your letter will appear here.</p>
        </div>
      )}

      {status === "loading" && !isStreaming && (
        <div className={styles.loading} aria-label="Generating letter">
          <div className={styles.orb} />
        </div>
      )}

      {status === "error" && (
        <div className={styles.error} role="alert">
          <AlertCircle size={28} aria-hidden />
          <p>{errorMessage ?? "Something went wrong. Please try again."}</p>
        </div>
      )}

      {hasBody && (
        <>
          <div className={cx(styles.body, isStreaming && styles.streaming)}>
            {text}
          </div>
          {status === "ready" && (
            <div className={styles.footer}>
              <button
                type="button"
                onClick={() => copy(text)}
                className={cx(styles.copyAction, copied && styles.copied)}
              >
                {copied ? "Copied!" : "Copy to clipboard"}
                {copied ? (
                  <Check size={16} aria-hidden />
                ) : (
                  <Copy size={16} aria-hidden />
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
