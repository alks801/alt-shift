"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CopyButton } from "@/components/ui/CopyButton";
import { Icon } from "@/components/ui/Icon";
import { IconAction } from "@/components/ui/IconAction";
import type { Letter } from "@/lib/types";
import styles from "./LetterCard.module.css";

interface LetterCardProps {
  letter: Letter;
  onDelete: (id: string) => void;
}

const ACTION_ICON_SIZE = 20;

export function LetterCard({ letter, onDelete }: LetterCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleAskDelete = () => setConfirmOpen(true);
  const handleCancelDelete = () => setConfirmOpen(false);
  const handleConfirmDelete = () => {
    setConfirmOpen(false);
    onDelete(letter.id);
  };

  const paragraphs = letter.body.split(/\n\n+/);

  return (
    <article
      className={styles.card}
      aria-label={[letter.jobTitle, letter.company].filter(Boolean).join(", ") || "Cover letter"}
    >
      <div className={styles.body}>
        {paragraphs.map((p, i) => (
          <p key={i} className={styles.paragraph}>
            {p}
          </p>
        ))}
      </div>
      <div className={styles.footer}>
        <IconAction
          tone="danger"
          leadingIcon={<Icon name="trash" size={ACTION_ICON_SIZE} />}
          onClick={handleAskDelete}
        >
          Delete
        </IconAction>
        <CopyButton text={letter.body} />
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
