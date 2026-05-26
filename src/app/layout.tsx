import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { LettersProvider } from "@/lib/letters/LettersContext";
import "./globals.css";

/**
 * Fixel — open-source MacPaw type family used as the brand face.
 * https://github.com/MacPaw/Fixel
 *
 * Two cuts:
 *   - Display: tighter spacing, used for h1/h2.
 *   - Text:    optimised for body copy, used for paragraphs, inputs, buttons.
 */
const fixelDisplay = localFont({
  src: [
    { path: "./fonts/FixelDisplay-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/FixelDisplay-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-fixel-display",
  display: "swap",
});

const fixelText = localFont({
  src: [
    { path: "./fonts/FixelText-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/FixelText-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/FixelText-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/FixelText-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-fixel-text",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alt+Shift — AI cover letters",
  description:
    "Generate sincere, tailored cover letters with AI. Track your progress toward your weekly application goal.",
};

/**
 * Viewport. `width=device-width, initial-scale=1` is the responsive baseline;
 * we don't lock zoom (`maximum-scale=1` etc.) because that breaks a11y
 * (users with low vision rely on pinch-zoom on phones).
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fixelDisplay.variable} ${fixelText.variable}`}>
      <body>
        <LettersProvider>{children}</LettersProvider>
      </body>
    </html>
  );
}
