"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function SprintPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/dashboard?view=sprint");
    }, 600);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="space-y-6 py-6">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-surface to-surface border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--dash-text-primary)]">
              Sprint Mode is now integrated directly into your Command Center Overview.
            </h2>
            <p className="text-xs text-[var(--dash-text-secondary)] mt-0.5">
              Launch and track 7-day smoke tests, live conversion rates, and backer velocity from your main dashboard. Redirecting...
            </p>
          </div>
        </div>
        <Link href="/dashboard?view=sprint" className="shrink-0">
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold gap-1.5 text-xs w-full sm:w-auto">
            <span>View in Command Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
