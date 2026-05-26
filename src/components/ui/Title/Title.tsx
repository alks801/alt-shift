import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Title.module.css";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/** `sm` → Figma "Display 24/32" (dialogs, compact sections).
 *  `md` → Figma "Display 36/44" (section / form headings).
 *  `lg` → Figma "Display 48/60" (page headings, e.g. dashboard). */
type TitleSize = "sm" | "md" | "lg";

type TitleProps<T extends HeadingTag> = {
  /** Semantic heading level. Defaults to `h1` — pick the level that matches
   *  the document outline, not the visual weight. */
  as?: T;
  /** Visual size. Defaults to `md`. Decoupled from `as` so an `<h2>` can
   *  still be the large display, and an `<h1>` can be the smaller one. */
  size?: TitleSize;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

/**
 * Display heading primitive. Locks in the Figma display type styles across
 * the app while letting callers pick the semantic tag (`<h1>`, `<h2>` …)
 * and the visual size independently. Decorative styles (e.g. the divider
 * under the `/new` page H1) layer on via `className`.
 */
export function Title<T extends HeadingTag = "h1">({
  as,
  size = "md",
  className,
  children,
  ...rest
}: TitleProps<T>) {
  const Tag = (as ?? "h1") as ElementType;
  return (
    <Tag className={cx(styles.title, styles[size], className)} {...rest}>
      {children}
    </Tag>
  );
}
