import type { CSSProperties } from "react";
import { cx } from "@/lib/cx";
import styles from "./Icon.module.css";

/**
 * Brand-owned icons that live as standalone SVG files under `public/`.
 *
 * One-colour icons are rendered via CSS `mask-image` so they inherit
 * `currentColor` from the surrounding text — this is what makes a Delete
 * button's icon turn red on hover, etc.
 *
 * Multi-colour icons (badges) are rendered via `background-image`, keeping
 * their baked-in palette; `currentColor` does not apply to them.
 */
export type IconName =
  | "home"
  | "plus"
  | "copy"
  | "trash"
  | "repeat"
  | "check"
  | "cat";

/** Icons that carry their own colours and must not be tinted. */
const COLORED_ICONS: ReadonlySet<IconName> = new Set<IconName>(["cat"]);

interface IconProps {
  name: IconName;
  /** Pixel size for both width and height. Defaults to 18. */
  size?: number;
  className?: string;
  /**
   * When omitted the icon is purely decorative (`aria-hidden`). Provide a label
   * for icons that carry standalone meaning — e.g. a status indicator with no
   * accompanying text — so screen readers announce it.
   */
  "aria-label"?: string;
}

export function Icon({ name, size = 18, className, "aria-label": ariaLabel }: IconProps) {
  const a11y = ariaLabel
    ? { role: "img" as const, "aria-label": ariaLabel }
    : { "aria-hidden": true as const };
  const variant = COLORED_ICONS.has(name) ? styles.colored : styles.mono;
  const style = {
    width: size,
    height: size,
    "--icon-url": `url("/${name}.svg")`,
  } as CSSProperties;

  return (
    <span
      className={cx(styles.icon, variant, className)}
      style={style}
      {...a11y}
    />
  );
}
