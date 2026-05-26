import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ProgressDots } from "@/components/ui/ProgressDots";
import { Title } from "@/components/ui/Title";
import { GOAL_LETTERS } from "@/lib/constants";
import { markers } from "@/lib/markers";
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
  count: number;
  /** Controls subtitle copy; does NOT affect the CTA — see `onCreateNew`. */
  variant: Variant;
  /** When set, CTA renders as `<Button>` invoking this handler (e.g. form reset).
   *  When omitted, CTA renders as `<ButtonLink href="/new">`. */
  onCreateNew?: () => void;
}

export function GoalBanner({ count, variant, onCreateNew }: GoalBannerProps) {
  const goal = GOAL_LETTERS;
  const value = Math.min(goal, count);
  const subtitle = SUBTITLE[variant];
  const ctaIcon = <Icon name="plus" size={24} />;
  const m = variant === "general" ? markers.newLetter.goalBanner : markers.dashboard.goalBanner;

  return (
    <section className={styles.banner} aria-labelledby="goal-banner-title" {...m.nodeProps}>
      <div className={styles.header}>
        <Title as="h2" id="goal-banner-title">
          Hit your goal
        </Title>
        <p className={styles.subtitle}>{subtitle}</p>
        {onCreateNew ? (
          <Button
            size="lg"
            onClick={onCreateNew}
            leadingIcon={ctaIcon}
            className={styles.cta}
            {...m.cta.nodeProps}
          >
            Create New
          </Button>
        ) : (
          <ButtonLink
            href="/new"
            size="lg"
            leadingIcon={ctaIcon}
            className={styles.cta}
            {...m.cta.nodeProps}
          >
            Create New
          </ButtonLink>
        )}
      </div>
      <div className={styles.progress} {...m.progress.nodeProps}>
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
