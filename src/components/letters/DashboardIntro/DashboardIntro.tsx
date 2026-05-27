import { Title } from "@/components/ui/Title";
import styles from "./DashboardIntro.module.css";

export function DashboardIntro() {
  return (
    <section className={styles.intro} aria-labelledby="intro-title">
      <Title as="h2" size="lg" id="intro-title" className={styles.title}>
        Cover letters that <span>sound like you</span>
      </Title>
      <p className={styles.subtitle}>
        Add a job title and a company. We&apos;ll draft a sincere, tailored letter you can read,
        tweak, and send on.
      </p>
    </section>
  );
}
