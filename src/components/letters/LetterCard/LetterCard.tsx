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


export function LetterCard({ letter, onDelete }: LetterCardProps) {
  const { copied, copy } = useCopyToClipboard();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCopy = () => copy(letter.body);
  const handleAskDelete = () => setConfirmOpen(true);
  const handleCancelDelete = () => setConfirmOpen(false);
  const handleConfirmDelete = () => {
    setConfirmOpen(false);
    onDelete(letter.id);
  };

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
          onClick={handleAskDelete}
        >
          Delete
        </IconAction>
        <IconAction
          tone={copied ? "success" : "neutral"}
          trailingIcon={<Icon name={copied ? "check" : "copy"} size={ACTION_ICON_SIZE} />}
          onClick={handleCopy}
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
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </article>
  );
}
