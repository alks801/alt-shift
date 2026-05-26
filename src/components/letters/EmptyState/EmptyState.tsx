import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Title } from "@/components/ui/Title";
import { GOAL_LETTERS } from "@/lib/constants";
import { markers } from "@/lib/markers";
import styles from "./EmptyState.module.css";

const m = markers.dashboard.emptyState;

export function EmptyState() {
  return (
    <section className={styles.wrap} aria-labelledby="empty-title" {...m.nodeProps}>
      <div className={styles.heading}>
        <Title as="h2" size="sm" id="empty-title" className={styles.title}>
          No applications yet
        </Title>
        <Icon name="cat" size={24} />
      </div>
      <p className={styles.subtitle}>
        Generate your first AI-written cover letter — your goal is {GOAL_LETTERS} applications to
        maximize your chances of getting hired.
      </p>
      <ButtonLink
        href="/new"
        leadingIcon={<Icon name="plus" />}
        className={styles.action}
        {...m.cta.nodeProps}
      >
        Create your first one
      </ButtonLink>
    </section>
  );
}
