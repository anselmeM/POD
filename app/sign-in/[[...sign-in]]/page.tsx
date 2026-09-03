import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { BRAND } from "@/lib/constants";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="text-center mb-6 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-blue flex items-center justify-center">
            <span className="text-white font-bold">P</span>
          </div>
          <span className="text-xl font-bold">{BRAND.shortName}</span>
        </Link>
      </div>

      <div className="relative z-10 flex justify-center w-full min-h-[520px]">
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
          fallback={
            <div className="w-full max-w-[400px] bg-surface border border-border rounded-2xl p-8 space-y-5 animate-pulse">
              <div className="h-6 bg-surface-elevated rounded w-1/2 mx-auto" />
              <div className="h-4 bg-surface-elevated rounded w-3/4 mx-auto" />
              <div className="h-10 bg-surface-elevated rounded-lg mt-6" />
              <div className="h-10 bg-surface-elevated rounded-lg" />
              <div className="h-px bg-border my-4" />
              <div className="h-10 bg-surface-elevated rounded-lg" />
            </div>
          }
        />
      </div>
    </div>
  );
}
