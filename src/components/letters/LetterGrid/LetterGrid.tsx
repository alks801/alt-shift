import { LetterCard } from "@/components/letters/LetterCard";
import type { Letter } from "@/lib/types";
import styles from "./LetterGrid.module.css";

interface LetterGridProps {
  letters: Letter[];
  /** Before hydration we render placeholder cards to keep layout stable. */
  hydrated: boolean;
  onDelete: (id: string) => void;
}

const SKELETON_COUNT = 2;

export function LetterGrid({ letters, hydrated, onDelete }: LetterGridProps) {
  if (!hydrated) {
    return (
      <div className={styles.grid} aria-hidden>
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <div key={i} className={styles.skeleton} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {letters.map((letter) => (
        <LetterCard key={letter.id} letter={letter} onDelete={onDelete} />
      ))}
    </div>
  );
}
