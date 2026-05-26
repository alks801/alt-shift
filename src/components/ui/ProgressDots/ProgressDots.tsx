import styles from "./ProgressDots.module.css";

interface ProgressDotsProps {
  value: number;
  total: number;
  variant?: "dot" | "bar";
  ariaLabel?: string;
}

export function ProgressDots({ value, total, variant = "dot", ariaLabel }: ProgressDotsProps) {
  const filled = Math.max(0, Math.min(total, value));
  const label = ariaLabel ?? `${filled} of ${total} completed`;
  const isBars = variant === "bar";

  return (
    <span className={isBars ? styles.bars : styles.dots} role="img" aria-label={label}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={isBars ? styles.bar : styles.dot}
          data-filled={i < filled || undefined}
        />
      ))}
    </span>
  );
}
