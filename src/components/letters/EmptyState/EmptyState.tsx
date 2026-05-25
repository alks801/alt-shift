import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { GOAL_LETTERS } from "@/lib/constants";
import styles from "./EmptyState.module.css";

export function EmptyState() {
  return (
    <section className={styles.wrap} aria-labelledby="empty-title">
      <h2 id="empty-title" className={styles.title}>
        No applications yet
      </h2>
      <p className={styles.subtitle}>
        Generate your first AI-written cover letter — your goal is{" "}
        {GOAL_LETTERS} applications to maximize your chances of getting hired.
      </p>
      <ButtonLink
        href="/new"
        leadingIcon={<Icon name="plus" />}
        className={styles.action}
      >
        Create your first one
      </ButtonLink>
    </section>
  );
}
