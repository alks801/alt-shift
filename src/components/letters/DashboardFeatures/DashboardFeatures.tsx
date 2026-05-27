import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon/Icon";
import { Title } from "@/components/ui/Title";
import styles from "./DashboardFeatures.module.css";

interface Feature {
  icon: IconName;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: "check",
    title: "Tailored to each role",
    description: "Every letter is written for that exact job and company. No copy-paste templates.",
  },
  {
    icon: "repeat",
    title: "Regenerate freely",
    description: "Don't like the result? Try again until it fits your voice.",
  },
  {
    icon: "lock",
    title: "Yours alone",
    description: "No accounts, no uploads. Letters live in your browser, on your device.",
  },
];

export function DashboardFeatures() {
  return (
    <section className={styles.section} aria-labelledby="features-title">
      <Title as="h2" size="md" id="features-title" className={styles.heading}>
        Start writing your cover letter
      </Title>
      <ul className={styles.features}>
        {FEATURES.map((feature) => (
          <li key={feature.title} className={styles.feature}>
            <span className={styles.featureIcon} aria-hidden>
              <Icon name={feature.icon} size={22} />
            </span>
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <p className={styles.featureDescription}>{feature.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
