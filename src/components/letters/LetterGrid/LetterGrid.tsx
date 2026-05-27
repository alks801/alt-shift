import { LetterCard } from "@/components/letters/LetterCard";
import type { Letter } from "@/lib/types";
import styles from "./LetterGrid.module.css";

interface LetterGridProps {
  letters: Letter[];
  onDelete: (id: string) => void;
}

export function LetterGrid({ letters, onDelete }: LetterGridProps) {
  return (
    <div className={styles.grid}>
      {letters.map((letter) => (
        <LetterCard key={letter.id} letter={letter} onDelete={onDelete} />
      ))}
    </div>
  );
}
