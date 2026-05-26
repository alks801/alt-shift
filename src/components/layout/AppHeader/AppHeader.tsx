"use client";

import Link from "next/link";
import { GoalStatus } from "@/components/letters/GoalStatus";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import styles from "./AppHeader.module.css";

interface AppHeaderProps {
  generatedCount: number;
}

export function AppHeader({ generatedCount }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" aria-label="Alt+Shift — go to dashboard">
          <Logo />
        </Link>
        <div className={styles.right}>
          <GoalStatus count={generatedCount} />
          <Link href="/" aria-label="Go to dashboard" title="Dashboard" className={styles.iconLink}>
            <Icon name="home" size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
}
