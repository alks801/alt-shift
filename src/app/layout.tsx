import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LettersProvider } from "@/lib/letters/LettersContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alt+Shift — AI cover letters",
  description:
    "Generate sincere, tailored cover letters with AI. Track your progress toward your weekly application goal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <LettersProvider>{children}</LettersProvider>
      </body>
    </html>
  );
}
