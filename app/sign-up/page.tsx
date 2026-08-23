"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BRAND } from "@/lib/constants";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="text-xl font-bold">{BRAND.shortName}</span>
          </Link>
          <h1 className="text-2xl font-bold">Start validating</h1>
          <p className="text-sm text-text-secondary mt-1">Create your account to begin your first validation sprint</p>
        </div>

        <Card className="p-6">
          <form onSubmit={(e) => { e.preventDefault(); router.push("/onboarding"); }} className="space-y-4">
            <Input label="Full name" placeholder="Alex Morgan" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email" type="email" placeholder="alex@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required hint="At least 8 characters" />
            <Button type="submit" className="w-full" size="lg">Create Account</Button>
          </form>

          <p className="text-xs text-text-tertiary mt-4 text-center">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </Card>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-blue hover:text-blue-bright">Sign in</Link>
        </p>
      </div>
    </div>
  );
}