"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Title } from "@/components/ui/Title";
import { DashboardFeatures } from "@/components/letters/DashboardFeatures";
import { DashboardIntro } from "@/components/letters/DashboardIntro";
import { EmptyState } from "@/components/letters/EmptyState";
import { GoalBanner } from "@/components/letters/GoalBanner";
import { LetterGrid } from "@/components/letters/LetterGrid";
import { useLettersContext } from "@/lib/letters/LettersContext";
import { GOAL_LETTERS } from "@/lib/constants";
import { markers } from "@/lib/markers";
import styles from "./page.module.css";

const m = markers.dashboard;

export default function DashboardPage() {
  const { letters, hydrated, deleteLetter } = useLettersContext();
  const count = letters.length;
  // List chrome (heading, Create New, GoalStatus, GoalBanner) only renders
  // once we know storage has letters. Before hydration we render nothing in
  // the content area — any concrete UI would lie about state we haven't read.
  const hasList = hydrated && count > 0;
  const showBanner = hasList && count < GOAL_LETTERS;

  return (
    <>
      <AppHeader generatedCount={hasList ? count : undefined} />
      <main {...m.nodeProps}>
        <PageContainer>
          <div className={styles.page}>
            {hasList && (
              <div className={styles.header}>
                <Title size="lg">Applications</Title>
                <ButtonLink
                  href="/new"
                  leadingIcon={<Icon name="plus" />}
                  className={styles.cta}
                  {...m.createNew.nodeProps}
                >
                  Create New
                </ButtonLink>
              </div>
            )}

            {hydrated && (
              <section className={styles.content}>
                {count === 0 ? (
                  <>
                    <DashboardIntro />
                    <EmptyState />
                    <DashboardFeatures />
                  </>
                ) : (
                  <LetterGrid letters={letters} onDelete={deleteLetter} />
                )}
              </section>
            )}
            {showBanner && <GoalBanner count={count} variant="today" />}
          </div>
        </PageContainer>
      </main>
    </>
  );
}
