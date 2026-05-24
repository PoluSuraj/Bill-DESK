import type { Metadata } from "next";
import Script from "next/script";
import { Manrope, Space_Grotesk } from "next/font/google";

import { ThemeProvider, STORAGE_KEY } from "@/components/shared/theme-provider";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

export const metadata: Metadata = {
  title: "Bill Desk | Multi-Business POS & Inventory",
  description:
    "Premium bill generation, inventory management, customer tracking, analytics, and AI insights for modern shopkeepers."
};

const themeInitScript = `(() => {
  const storageKey = ${JSON.stringify(STORAGE_KEY)};
  const root = document.documentElement;
  const savedTheme = window.localStorage.getItem(storageKey);
  const theme = savedTheme === "light" || savedTheme === "dark"
    ? savedTheme
    : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
