"use client";

import { Plus } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { ButtonLink } from "@/components/ui/Button";
import { LetterCard } from "@/components/letters/LetterCard";
import { GoalBanner } from "@/components/letters/GoalBanner";
import { EmptyState } from "@/components/letters/EmptyState";
import { useLettersContext } from "@/lib/letters/LettersContext";
import { GOAL_LETTERS } from "@/lib/constants";
import styles from "./page.module.css";

export default function DashboardPage() {
  const { letters, hydrated, deleteLetter } = useLettersContext();
  const count = letters.length;
  const showBanner = hydrated && count > 0 && count < GOAL_LETTERS;

  return (
    <>
      <AppHeader generatedCount={count} />
      <main>
        <PageContainer>
          <div className={styles.page}>
            <div className={styles.header}>
              <h1 className={styles.title}>Applications</h1>
              <ButtonLink href="/new" leadingIcon={<Plus size={18} />}>
                Create New
              </ButtonLink>
            </div>

            {!hydrated ? (
              <div className={styles.grid} aria-hidden>
                <div className={styles.skeleton} />
                <div className={styles.skeleton} />
              </div>
            ) : count === 0 ? (
              <EmptyState />
            ) : (
              <div className={styles.grid}>
                {letters.map((letter) => (
                  <LetterCard
                    key={letter.id}
                    letter={letter}
                    onDelete={deleteLetter}
                  />
                ))}
              </div>
            )}

            {showBanner && <GoalBanner count={count} />}
          </div>
        </PageContainer>
      </main>
    </>
  );
}
