import styles from "./Logo.module.css";

interface LogoProps {
  /** Hide the wordmark, render only the mark. Used in compact header slots. */
  iconOnly?: boolean;
}

export function Logo({ iconOnly = false }: LogoProps) {
  return (
    <span className={styles.logo} aria-label="Alt+Shift">
      <span className={styles.mark} aria-hidden>
        <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%">
          <path
            d="M3 22c4-1.6 7.5-1.6 11 0 3.5 1.6 7 1.6 11 0"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M3 17c4-1.6 7.5-1.6 11 0 3.5 1.6 7 1.6 11 0"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M3 12c4-1.6 7.5-1.6 11 0 3.5 1.6 7 1.6 11 0"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      </span>
      {!iconOnly && <span className={styles.wordmark}>Alt+Shift</span>}
    </span>
  );
}
