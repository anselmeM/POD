"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md w-full">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-red/10 border border-red/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-text-secondary">
            An unexpected error occurred while loading this page.
          </p>
        </div>

        {error?.message && (
          <div className="p-3 rounded-xl bg-surface-elevated border border-border text-xs text-text-tertiary font-mono text-left break-words max-h-28 overflow-y-auto">
            {error.message}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button onClick={() => reset()} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Reload Page
          </Button>
          <Link href="/">
            <Button variant="secondary" className="gap-2">
              <Home className="w-4 h-4" /> Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
