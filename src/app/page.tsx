"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/letters/EmptyState";
import { GoalBanner } from "@/components/letters/GoalBanner";
import { LetterGrid } from "@/components/letters/LetterGrid";
import { useLettersContext } from "@/lib/letters/LettersContext";
import { GOAL_LETTERS } from "@/lib/constants";
import styles from "./page.module.css";

export default function DashboardPage() {
  const { letters, hydrated, deleteLetter } = useLettersContext();
  const count = letters.length;
  const isEmpty = hydrated && count === 0;
  const showBanner = hydrated && count > 0 && count < GOAL_LETTERS;

  return (
    <>
      <AppHeader generatedCount={count} />
      <main>
        <PageContainer>
          <div className={styles.page}>
            <div className={styles.header}>
              <h1 className={styles.title}>Applications</h1>
              <ButtonLink href="/new" leadingIcon={<Icon name="plus" />}>
                Create New
              </ButtonLink>
            </div>

            <section className={styles.content}>
              {isEmpty ? (
                <EmptyState />
              ) : (
                <LetterGrid
                  letters={letters}
                  hydrated={hydrated}
                  onDelete={deleteLetter}
                />
              )}
              {showBanner && <GoalBanner count={count} />}
            </section>
          </div>
        </PageContainer>
      </main>
    </>
  );
}
