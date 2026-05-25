"use client";

import { useState } from "react";
import { Copy, Check, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useCopyToClipboard } from "@/lib/hooks/useCopyToClipboard";
import type { Letter } from "@/lib/types";
import { cx } from "@/lib/cx";
import styles from "./LetterCard.module.css";

interface LetterCardProps {
  letter: Letter;
  onDelete: (id: string) => void;
}

export function LetterCard({ letter, onDelete }: LetterCardProps) {
  const { copied, copy } = useCopyToClipboard();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const title = [letter.jobTitle, letter.company].filter(Boolean).join(", ");

  return (
    <article className={styles.card}>
      {title && <header className={styles.header}>{title}</header>}
      <div className={styles.body}>{letter.body}</div>
      <div className={styles.footer}>
        <button
          type="button"
          className={styles.action}
          data-tone="danger"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 size={16} aria-hidden />
          Delete
        </button>
        <button
          type="button"
          className={cx(styles.action, copied && styles.actionCopied)}
          onClick={() => copy(letter.body)}
        >
          {copied ? "Copied!" : "Copy to clipboard"}
          {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
        </button>
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
