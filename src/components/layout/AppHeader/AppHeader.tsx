"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ProgressDots } from "@/components/ui/ProgressDots";
import { GOAL_LETTERS } from "@/lib/constants";
import iconButtonStyles from "@/components/ui/IconButton/IconButton.module.css";
import styles from "./AppHeader.module.css";

interface AppHeaderProps {
  generatedCount: number;
}

export function AppHeader({ generatedCount }: AppHeaderProps) {
  const goal = GOAL_LETTERS;
  const value = Math.min(goal, generatedCount);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" aria-label="Alt+Shift — go to dashboard">
          <Logo />
        </Link>
        <div className={styles.right}>
          <span className={styles.status} aria-live="polite">
            <span className={styles.statusText}>
              {value}/{goal} applications generated
            </span>
            <ProgressDots
              value={value}
              total={goal}
              ariaLabel={`${value} of ${goal} applications generated`}
            />
          </span>
          <Link
            href="/"
            aria-label="Go to dashboard"
            title="Dashboard"
            className={iconButtonStyles.iconButton}
          >
            <Home size={18} aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}
