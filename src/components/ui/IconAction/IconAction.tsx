import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./IconAction.module.css";

/** Visual tone for the inline action.
 *  - `neutral` (default) — muted text, darkens on hover.
 *  - `danger`  — turns red on hover (destructive action).
 *  - `success` — brand green; pair with a "done" affordance like Copied!. */
export type IconActionTone = "neutral" | "danger" | "success";

export interface IconActionProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  tone?: IconActionTone;
  children: ReactNode;
}

/**
 * Inline text+icon action button used in card / preview footers. Shares its
 * type style (16/24 semibold) with the rest of the design system but has no
 * fill or border, so it sits inside content without breaking the layout.
 */
export function IconAction({
  leadingIcon,
  trailingIcon,
  tone = "neutral",
  className,
  type = "button",
  children,
  ...rest
}: IconActionProps) {
  return (
    <button
      type={type}
      className={cx(
        styles.root,
        tone === "danger" && styles.danger,
        tone === "success" && styles.success,
        className,
      )}
      {...rest}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}
