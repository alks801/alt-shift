import Image from "next/image";
import styles from "./Logo.module.css";

interface LogoProps {
  /** Pixel height of the logo. Width auto-scales to preserve aspect ratio. */
  height?: number;
}

/**
 * Brand mark + wordmark, served as a single optimised PNG from `/public`.
 * The asset already includes the "Alt+Shift" wordmark — no separate text
 * element is rendered, which keeps the logo pixel-perfect at any zoom level.
 */
export function Logo({ height = 48 }: LogoProps) {
  const width = Math.round((height * 179) / 48);
  return (
    <Image
      src="/logo.svg"
      alt="Alt+Shift"
      width={width}
      height={height}
      priority
      className={styles.logo}
    />
  );
}
