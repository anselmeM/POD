import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { BRAND } from "@/lib/constants";

export default function SignInPage() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isConfigured =
    publishableKey &&
    !publishableKey.includes("please-provide-clerk-key") &&
    publishableKey !== "pk_test_...";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="text-center mb-8 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue flex items-center justify-center">
            <span className="text-white font-bold">P</span>
          </div>
          <span className="text-xl font-bold">{BRAND.shortName}</span>
        </Link>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-text-secondary mt-1">Sign in to your validation dashboard</p>
      </div>

      <div className="relative z-10 flex justify-center w-full">
        {isConfigured ? (
          <SignIn
            appearance={{
              elements: {
                card: "bg-surface border border-border shadow-2xl rounded-2xl",
                headerTitle: "text-text-primary",
                headerSubtitle: "text-text-secondary",
                socialButtonsBlockButton: "bg-surface-elevated border border-border text-text-primary hover:bg-surface",
                formButtonPrimary: "bg-blue hover:bg-blue-bright text-white",
                footerActionLink: "text-blue hover:underline",
              },
            }}
          />
        ) : (
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue/10 border border-blue/20 flex items-center justify-center mx-auto text-blue text-xl font-bold">
              🔑
            </div>
            <h3 className="text-lg font-bold">Clerk API Keys Required</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              To enable Google Sign-In and new user registration, add your Clerk keys in your Vercel Dashboard (or local <code className="text-xs bg-surface-elevated px-1.5 py-0.5 rounded text-blue">.env</code>):
            </p>
            <div className="bg-surface-elevated p-3 rounded-lg text-left text-xs font-mono space-y-1 text-text-tertiary">
              <p>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</p>
              <p>CLERK_SECRET_KEY</p>
            </div>
            <p className="text-xs text-text-tertiary">
              Get free keys at <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" className="text-blue underline">dashboard.clerk.com</a>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
