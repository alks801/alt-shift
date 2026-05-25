import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ProgressDots } from "@/components/ui/ProgressDots";
import { GOAL_LETTERS } from "@/lib/constants";
import styles from "./GoalBanner.module.css";

interface GoalBannerProps {
  count: number;
}

/**
 * Motivational banner shown under the dashboard list while the user is below
 * the goal. Copy and progress adapt to remaining count.
 */
export function GoalBanner({ count }: GoalBannerProps) {
  const goal = GOAL_LETTERS;
  const value = Math.min(goal, count);
  const remaining = Math.max(0, goal - count);

  const subtitle =
    remaining === 1
      ? "Just one more application to hit your goal."
      : "Generate and send out couple more job applications today to get hired faster.";

  return (
    <section className={styles.banner} aria-labelledby="goal-banner-title">
      <h2 id="goal-banner-title" className={styles.title}>
        Hit your goal
      </h2>
      <p className={styles.subtitle}>{subtitle}</p>
      <ButtonLink
        href="/new"
        leadingIcon={<Icon name="plus" />}
        className={styles.action}
      >
        Create New
      </ButtonLink>
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
