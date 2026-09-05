"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Script from "next/script";
import type { LandingPage } from "@/lib/types";
import { templateRenderers } from "./templates";

export default function PublicLandingPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [preorderBanner, setPreorderBanner] = useState<"success" | "cancelled" | null>(null);
  const trackedScrolls = useRef<Record<number, boolean>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("preorder_success") === "1") {
        setPreorderBanner("success");
      } else if (searchParams.get("preorder_cancelled") === "1") {
        setPreorderBanner("cancelled");
      }
    }
  }, []);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    fetch(`/api/landing-pages/${slug}`)
      .then((r) => r.ok ? r.json() : null)
      .then((json) => setPage(json?.data ?? null))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [slug]);

  // Automated Tracking: Page View, UTM Attribution & Scroll Depth
  useEffect(() => {
    if (!slug || !page) return;

    let visitorId = "vis-anon";
    try {
      visitorId = localStorage.getItem("pod_vid") || "";
      if (!visitorId) {
        visitorId = `vis-${Math.random().toString(36).slice(2, 9)}`;
        localStorage.setItem("pod_vid", visitorId);
      }
    } catch {
      visitorId = `vis-${Math.random().toString(36).slice(2, 9)}`;
    }

    // Capture URL UTM parameters & platform click IDs
    const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const urlTracking = {
      utm_source: searchParams?.get("utm_source") || "",
      utm_medium: searchParams?.get("utm_medium") || "",
      utm_campaign: searchParams?.get("utm_campaign") || "",
      utm_content: searchParams?.get("utm_content") || "",
      utm_term: searchParams?.get("utm_term") || "",
      gclid: searchParams?.get("gclid") || "",
      fbclid: searchParams?.get("fbclid") || "",
      li_fat_id: searchParams?.get("li_fat_id") || "",
    };

    if (urlTracking.utm_source || urlTracking.gclid || urlTracking.fbclid || urlTracking.li_fat_id) {
      try {
        sessionStorage.setItem("pod_tracking_params", JSON.stringify(urlTracking));
      } catch {}
    }

    const savedTracking = (() => {
      try {
        return JSON.parse(sessionStorage.getItem("pod_tracking_params") || "{}");
      } catch {
        return {};
      }
    })();

    const activeTracking = { ...savedTracking, ...urlTracking };

    // Fire Page View Beacon
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        eventType: "page_view",
        visitorId,
        metadata: {
          referrer: document.referrer || "direct",
          userAgent: navigator.userAgent,
          ...activeTracking,
        },
      }),
    }).catch(() => {});

    // Instrument Scroll Depth
    const handleScroll = () => {
      const h = document.documentElement;
      const b = document.body;
      const st = "scrollTop" in h ? h.scrollTop : b.scrollTop;
      const sh = "scrollHeight" in h ? h.scrollHeight : b.scrollHeight;
      const percent = Math.floor((st / (sh - h.clientHeight)) * 100);

      [25, 50, 75].forEach((threshold) => {
        if (percent >= threshold && !trackedScrolls.current[threshold]) {
          trackedScrolls.current[threshold] = true;
          fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              slug,
              eventType: `scroll_${threshold}`,
              visitorId,
              metadata: { depth: threshold, ...activeTracking },
            }),
          }).catch(() => {});
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [slug, page]);

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
  const pixels = page.trackingPixels;

  return (
    <div className="relative">
      {/* Meta (Facebook) Pixel */}
      {pixels?.metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixels.metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* Google Ads / Analytics Tag */}
      {pixels?.googleAdsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${pixels.googleAdsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-tag" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${pixels.googleAdsId}');
            `}
          </Script>
        </>
      )}

      {/* LinkedIn Insight Tag */}
      {pixels?.linkedinPartnerId && (
        <Script id="linkedin-tag" strategy="afterInteractive">
          {`
            _linkedin_partner_id = "${pixels.linkedinPartnerId}";
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
            (function(l) {
              if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
              window.lintrk.q=[]}
              var s = document.getElementsByTagName("script")[0];
              var b = document.createElement("script");
              b.type = "text/javascript";b.async = true;
              b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
              s.parentNode.insertBefore(b, s);
            })(window.lintrk);
          `}
        </Script>
      )}

      {preorderBanner === "success" && (
        <div className="sticky top-0 z-50 px-4 py-3 bg-emerald-500/20 border-b border-emerald-500/40 text-center backdrop-blur-md">
          <p className="text-sm text-emerald-300 font-medium">
            🎉 <strong>Pre-Order Confirmed!</strong> Your founding reservation has been secured. Check your email for onboarding details.
          </p>
        </div>
      )}

      {preorderBanner === "cancelled" && (
        <div className="sticky top-0 z-50 px-4 py-2.5 bg-slate-800/90 border-b border-slate-700 text-center backdrop-blur-md">
          <p className="text-xs text-slate-300 font-medium">
            Your pre-order reservation was not completed. No charges were made.
          </p>
        </div>
      )}

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

