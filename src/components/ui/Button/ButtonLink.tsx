import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import { buttonClassName, type ButtonStyleProps } from "./Button";

interface ButtonLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>,
    LinkProps,
    ButtonStyleProps {
  leadingIcon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Next.js `<Link>` styled identically to `<Button>`. Use this whenever the
 * action navigates the user — the right element semantically is an anchor,
 * not a button.
 */
export function ButtonLink({
  variant,
  size,
  leadingIcon,
  children,
  className,
  ...linkProps
}: ButtonLinkProps) {
  return (
    <Link
      {...linkProps}
      className={cx(buttonClassName({ variant, size }), className)}
    >
      {leadingIcon}
      {children}
    </Link>
  );
}
