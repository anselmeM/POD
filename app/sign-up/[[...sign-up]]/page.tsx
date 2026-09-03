import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { BRAND } from "@/lib/constants";

export default function SignUpPage() {
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
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-text-secondary mt-1">Start validating demand with real evidence</p>
      </div>

      <div className="relative z-10 flex justify-center w-full">
        <SignUp
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
      </div>
    </div>
  );
}
