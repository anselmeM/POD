"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md w-full">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-amber/10 border border-amber/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--dash-text-primary)] mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-[var(--dash-text-secondary)]">
            We encountered an unexpected issue while loading this section of the dashboard.
          </p>
        </div>

        {error?.message && (
          <div className="p-3 rounded-xl bg-surface-elevated border border-border text-xs text-text-tertiary font-mono text-left break-words max-h-28 overflow-y-auto">
            {error.message}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button onClick={() => reset()} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Try Again
          </Button>
          <Link href="/">
            <Button variant="secondary" className="gap-2">
              <Home className="w-4 h-4" /> Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
