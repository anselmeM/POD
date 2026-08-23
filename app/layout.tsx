import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Proof of Demand — Prove demand before you build.",
  description:
    "AI-powered demand validation for founders who want evidence—not opinions—before spending months building a product.",
  keywords: ["startup validation", "demand testing", "lean startup", "MVP validation", "proof of demand"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-mono/style.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}