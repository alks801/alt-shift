import { Icon } from "@/components/ui/Icon";
import { ProgressDots } from "@/components/ui/ProgressDots";
import { GOAL_LETTERS } from "@/lib/constants";
import styles from "./GoalStatus.module.css";

interface GoalStatusProps {
  count: number;
}

/**
 * Compact "X/Y applications generated" status shown in the app header.
 *
 * Below the goal: progress dots. At/above the goal: a check badge — the
 * dots are replaced rather than fully filled so the milestone reads clearly
 * at a glance.
 */
export function GoalStatus({ count }: GoalStatusProps) {
  const goal = GOAL_LETTERS;
  const value = Math.min(goal, Math.max(0, count));
  const reached = value >= goal;
  const label = `${value} of ${goal} applications generated`;

  return (
    <span className={styles.root} aria-live="polite">
      <span className={styles.label}>
        {value}/{goal} applications generated
      </span>
      {reached ? (
        <span className={styles.badge} role="img" aria-label={`Goal reached: ${label}`}>
          <Icon name="check" size={28} />
        </span>
      ) : (
        <ProgressDots value={value} total={goal} ariaLabel={label} />
      )}
    </span>
  );
}
