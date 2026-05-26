import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ProgressDots } from "@/components/ui/ProgressDots";
import { Title } from "@/components/ui/Title";
import { GOAL_LETTERS } from "@/lib/constants";
import styles from "./GoalBanner.module.css";

/** `general` — universal copy (used on the new-letter form).
 *  `today`   — adds a "today" nudge (used on the dashboard list). */
type Variant = "general" | "today";

const SUBTITLE: Record<Variant, string> = {
  general:
    "Generate and send out couple more job applications to get hired faster",
  today:
    "Generate and send out couple more job applications today to get hired faster",
};

interface GoalBannerProps {
  count: number;
  variant: Variant;
}

/**
 * Motivational banner shown while the user is below the goal. Progress
 * adapts to the remaining count; subtitle copy is picked from `SUBTITLE`
 * by `variant`.
 */
export function GoalBanner({ count, variant }: GoalBannerProps) {
  const goal = GOAL_LETTERS;
  const value = Math.min(goal, count);
  const subtitle = SUBTITLE[variant];

  return (
    <section className={styles.banner} aria-labelledby="goal-banner-title">
      <div className={styles.header}>
        <Title as="h2" id="goal-banner-title">
          Hit your goal
        </Title>
        <p className={styles.subtitle}>{subtitle}</p>
        <ButtonLink href="/new" size="lg" leadingIcon={<Icon name="plus" size={24} />}>
          Create New
        </ButtonLink>
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
