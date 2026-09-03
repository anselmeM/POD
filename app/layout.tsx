import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Proof of Demand — Prove demand before you build.",
  description:
    "AI-powered demand validation for founders who want evidence—not opinions—before spending months building a product.",
  keywords: ["startup validation", "demand testing", "lean startup", "MVP validation", "proof of demand"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isConfigured =
    publishableKey &&
    !publishableKey.includes("please-provide-clerk-key") &&
    publishableKey !== "pk_test_...";

  const content = (
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );

  if (!isConfigured) {
    return content;
  }

  return <ClerkProvider publishableKey={publishableKey}>{content}</ClerkProvider>;
}