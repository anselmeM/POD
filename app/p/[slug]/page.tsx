"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { LandingPage } from "@/lib/types";
import { templateRenderers } from "./templates";

export default function PublicLandingPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    fetch(`/api/landing-pages/${slug}`)
      .then((r) => r.ok ? r.json() : null)
      .then((json) => setPage(json?.data ?? null))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="text-xl font-bold mb-2">Page not found</h1>
        <p className="text-sm text-text-secondary mb-6">This landing page doesn&apos;t exist or has been removed.</p>
        <Link href="/" className="text-sm text-blue hover:underline">Go to homepage</Link>
      </div>
    );
  }

  const Renderer = templateRenderers[page.template] || templateRenderers.hero;

  return (
    <div className="relative">
      {page.status !== "live" && (
        <div className="sticky top-0 z-50 px-4 py-2 bg-amber/10 border-b border-amber/20 text-center">
          <p className="text-xs text-amber font-medium">
            This page is currently {page.status} — only you can see it.
            <Link href="/dashboard/landing-pages" className="ml-2 underline hover:text-amber">Go to dashboard</Link>
          </p>
        </div>
      )}
      <Renderer page={page} />
    </div>
  );
}
