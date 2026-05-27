import type { CSSProperties } from "react";
import { cx } from "@/lib/cx";
import styles from "./Icon.module.css";

/* Mono icons use mask-image → inherit currentColor; coloured use background-image. */
export type IconName = "home" | "plus" | "copy" | "trash" | "repeat" | "check" | "cat" | "lock";

/** Icons that carry their own colours and must not be tinted. */
const COLORED_ICONS: ReadonlySet<IconName> = new Set<IconName>(["cat"]);

interface IconProps {
  name: IconName;
  /** Pixel size for both width and height. Defaults to 18. */
  size?: number;
  className?: string;
  /** Semantic label; omit for decorative icons (`aria-hidden`). */
  "aria-label"?: string;
}

export function Icon({ name, size = 20, className, "aria-label": ariaLabel }: IconProps) {
  const a11y = ariaLabel
    ? { role: "img" as const, "aria-label": ariaLabel }
    : { "aria-hidden": true as const };
  const variant = COLORED_ICONS.has(name) ? styles.colored : styles.mono;
  const style = {
    width: size,
    height: size,
    "--icon-url": `url("/${name}.svg")`,
  } as CSSProperties;

  return <span className={cx(styles.icon, variant, className)} style={style} {...a11y} />;
}
