"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { IconAction } from "@/components/ui/IconAction";
import { useCopyToClipboard } from "@/lib/hooks/useCopyToClipboard";
import type { Letter } from "@/lib/types";
import styles from "./LetterCard.module.css";

interface LetterCardProps {
  letter: Letter;
  onDelete: (id: string) => void;
}

const ACTION_ICON_SIZE = 20;

/** Collapse blank lines so the preview reads as tight prose — the original
 *  letter (with paragraph breaks) is still what gets copied to clipboard. */
function previewText(body: string): string {
  return body.replace(/\n{2,}/g, "\n");
}

export function LetterCard({ letter, onDelete }: LetterCardProps) {
  const { copied, copy } = useCopyToClipboard();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <article
      className={styles.card}
      aria-label={
        [letter.jobTitle, letter.company].filter(Boolean).join(", ") ||
        "Cover letter"
      }
    >
      <div className={styles.body}>{letter.body}</div>
      <div className={styles.footer}>
        <IconAction
          tone="danger"
          leadingIcon={<Icon name="trash" size={ACTION_ICON_SIZE} />}
          onClick={() => setConfirmOpen(true)}
        >
          Delete
        </IconAction>
        <IconAction
          tone={copied ? "success" : "neutral"}
          trailingIcon={<Icon name={copied ? "check" : "copy"} size={ACTION_ICON_SIZE} />}
          onClick={() => copy(letter.body)}
        >
          {copied ? "Copied!" : "Copy to clipboard"}
        </IconAction>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this application?"
        description="The generated letter will be removed from your device. This can't be undone."
        confirmLabel="Delete"
        cancelLabel="Keep it"
        tone="danger"
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete(letter.id);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </article>
  );
}
