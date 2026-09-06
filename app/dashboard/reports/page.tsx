"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function ReportsPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/dashboard/ai-analyst?export=ready");
    }, 600);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="space-y-6 py-6">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 via-surface to-surface border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--dash-text-primary)]">
              Executive reporting is now unified into the AI Verdict & Analyst Engine.
            </h2>
            <p className="text-xs text-[var(--dash-text-secondary)] mt-0.5">
              Access real-time synthesis, statistical proof-of-demand scoring, and exportable executive briefs. Redirecting...
            </p>
          </div>
        </div>
        <Link href="/dashboard/ai-analyst?export=ready" className="shrink-0">
          <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white gap-1.5 text-xs w-full sm:w-auto">
            <span>Open AI Verdict Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
