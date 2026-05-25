import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./PageContainer.module.css";

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cx(styles.container, className)}>{children}</div>;
}
