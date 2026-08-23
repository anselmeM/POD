import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-blue flex items-center justify-center">
            <span className="text-white text-2xl font-bold">P</span>
          </div>
        </div>
        <div>
          <h1 className="text-6xl font-bold text-text-primary mb-2">404</h1>
          <p className="text-lg text-text-secondary">This page doesn&apos;t exist.</p>
        </div>
        <p className="text-sm text-text-tertiary max-w-md mx-auto">
          The page you&apos;re looking for may have been moved, deleted, or never existed. Check the URL or head back home.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/"><Button>Go Home</Button></Link>
          <Link href="/dashboard"><Button variant="secondary">Dashboard</Button></Link>
        </div>
      </div>
    </div>
  );
}