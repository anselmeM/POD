"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function SignalsPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/dashboard/leads?tab=signals");
    }, 600);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="space-y-6 py-6">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue/10 via-surface to-surface border border-blue/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue/20 flex items-center justify-center text-blue shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--dash-text-primary)]">
              Behavioral signals are now co-located directly inside the Demand & Signals Hub.
            </h2>
            <p className="text-xs text-[var(--dash-text-secondary)] mt-0.5">
              Inspect live funnel progress, willingness-to-pay, and prospect telemetry in one unified command view. Redirecting...
            </p>
          </div>
        </div>
        <Link href="/dashboard/leads?tab=signals" className="shrink-0">
          <Button size="sm" className="bg-blue hover:bg-blue/90 text-white gap-1.5 text-xs w-full sm:w-auto">
            <span>View in Demand Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
