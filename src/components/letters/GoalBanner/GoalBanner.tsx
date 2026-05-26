import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ProgressDots } from "@/components/ui/ProgressDots";
import { Title } from "@/components/ui/Title";
import { GOAL_LETTERS } from "@/lib/constants";
import styles from "./GoalBanner.module.css";

/** `general` — used on the new-letter form (CTA must reset the form,
 *             so the caller passes `onCreateNew`).
 *  `today`   — used on the dashboard list (CTA links to /new). */
type Variant = "general" | "today";

const SUBTITLE: Record<Variant, string> = {
  general: "Generate and send out couple more job applications to get hired faster",
  today: "Generate and send out couple more job applications today to get hired faster",
};

interface GoalBannerProps {
  /** Number of letters generated so far. Drives the progress indicator
   *  ("X out of GOAL_LETTERS") and the filled segments of the progress bar. */
  count: number;
  /** Picks which subtitle copy to show. Does NOT affect the CTA — that's
   *  controlled by `onCreateNew`. See `SUBTITLE` for the exact strings. */
  variant: Variant;
  /** Optional CTA handler.
   *  - When provided → the "Create New" CTA renders as a `<Button>` and
   *    invokes this handler on click. Use on pages where navigating to
   *    `/new` would be a no-op (e.g. the new-letter page itself, to reset
   *    its form instead).
   *  - When omitted  → the CTA renders as a `<ButtonLink href="/new">`. */
  onCreateNew?: () => void;
}

/**
 * Motivational banner shown while the user is below the goal. Progress
 * adapts to the remaining count; subtitle copy is picked from `SUBTITLE`
 * by `variant`. The CTA is a link to `/new` by default, or a button that
 * calls `onCreateNew` if provided (used on the new-letter page itself,
 * where a navigation to `/new` would be a no-op).
 */
export function GoalBanner({ count, variant, onCreateNew }: GoalBannerProps) {
  const goal = GOAL_LETTERS;
  const value = Math.min(goal, count);
  const subtitle = SUBTITLE[variant];
  const ctaIcon = <Icon name="plus" size={24} />;

  return (
    <section className={styles.banner} aria-labelledby="goal-banner-title">
      <div className={styles.header}>
        <Title as="h2" id="goal-banner-title">
          Hit your goal
        </Title>
        <p className={styles.subtitle}>{subtitle}</p>
        {onCreateNew ? (
          <Button size="lg" onClick={onCreateNew} leadingIcon={ctaIcon}>
            Create New
          </Button>
        ) : (
          <ButtonLink href="/new" size="lg" leadingIcon={ctaIcon}>
            Create New
          </ButtonLink>
        )}
      </div>
      <div className={styles.progress}>
        <ProgressDots
          value={value}
          total={goal}
          variant="bar"
          ariaLabel={`${value} of ${goal} applications generated`}
        />
        <span className={styles.progressLabel}>
          {value} out of {goal}
        </span>
      </div>
    </section>
  );
}
