import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedWorkspace } from "@/lib/workspace";
import type { AdCopyVariation } from "@/lib/types";

interface AdCampaignResponse {
  conceptTitle: string;
  targetAudience: string;
  variations: AdCopyVariation[];
  targetingBlueprint: {
    targetJobTitles: string[];
    recommendedKeywords: string[];
    negativeKeywords: string[];
    estimatedPlatformCpc: Record<string, number>;
  };
}

function generateHeuristicAdCampaign(
  title: string,
  positioning: string,
  targetAudience: string,
  slug: string
): AdCampaignResponse {
  const cleanTitle = title.trim() || "B2B SaaS Automation";
  const cleanAudience = targetAudience.trim() || "Operations Managers, Startup Founders, and Engineering Leads";
  const cleanSlug = slug || "preview";

  const variations: AdCopyVariation[] = [
    // Meta Ads - Angle 1: Pain Point Agitation
    {
      id: "meta-angle-1",
      platform: "meta",
      angle: "Pain Point Agitation",
      headline: `Tired of Manual Overhead?`,
      description: `Automate ${cleanTitle.slice(0, 20)} in minutes.`,
      primaryText: `Still wasting hours every week on repetitive manual work? Most teams lose 20% of productive time to busywork.\n\nMeet ${cleanTitle}—the streamlined solution designed for ${cleanAudience.slice(0, 40)} to execute faster with zero errors.\n\nLock in 50% founding discount access today.`,
      callToAction: "Get Priority Access",
      recommendedAudience: "Interest: Workflow automation, SaaS tools, Productivity",
      estimatedCpc: 1.25,
    },
    // Meta Ads - Angle 2: Speed & Outcome ROI
    {
      id: "meta-angle-2",
      platform: "meta",
      angle: "Speed & Velocity",
      headline: `Cut Workloads by 50% This Week`,
      description: `Founding access now open.`,
      primaryText: `What if your team could achieve 5x faster output without hiring more staff?\n\n${cleanTitle} eliminates the bottleneck so you can focus on high-impact growth. Onboarding our private founding cohort now.`,
      callToAction: "Claim Founding Spot",
      recommendedAudience: "Interest: Growth hacking, Startup founders, Tech executives",
      estimatedCpc: 1.15,
    },

    // LinkedIn Ads - Angle 1: Executive ROI
    {
      id: "linkedin-angle-1",
      platform: "linkedin",
      angle: "Operational Efficiency & ROI",
      headline: `${cleanTitle} for Modern Teams`,
      description: `Engineered specifically for high-growth operations.`,
      primaryText: `Top-performing teams are replacing legacy spreadsheets with ${cleanTitle}.\n\n✓ Save 12+ hours per team member weekly\n✓ Prevent costly human errors & missed handoffs\n✓ 1-click integration with your existing stack\n\nRequest private beta access before public release.`,
      callToAction: "Request Beta Access",
      recommendedAudience: "Job Functions: Operations, Product Management, Engineering Leads",
      estimatedCpc: 4.75,
    },
    // LinkedIn Ads - Angle 2: Reliability & Scale
    {
      id: "linkedin-angle-2",
      platform: "linkedin",
      angle: "Quality & Governance",
      headline: `Stop Losing Revenue to Inefficiencies`,
      description: `Enterprise-grade reliability for ${cleanTitle.slice(0, 25)}.`,
      primaryText: `Scaling your organization shouldn't mean scaling manual headaches. ${cleanTitle} brings automated governance and peace of mind to ${cleanAudience.slice(0, 35)}.\n\nSee how forward-thinking leaders are proving the standard.`,
      callToAction: "Join Private Beta",
      recommendedAudience: "Company Size: 50-500 employees, Director level and above",
      estimatedCpc: 5.10,
    },

    // Google Search Ads (RSAs) - Angle 1: High Intent Solution
    {
      id: "google-angle-1",
      platform: "google",
      angle: "Direct Intent Solution",
      headline: `${cleanTitle.slice(0, 30)}`,
      description: `Streamline your operations with intelligent automation. Onboarding founding members now.`,
      displayPath: `${cleanSlug.slice(0, 15)}/solution`,
      headlines: [
        cleanTitle.slice(0, 30),
        `Automate Workflow in Minutes`.slice(0, 30),
        `Cut Overhead by 50% Today`.slice(0, 30),
      ],
      descriptions: [
        `Save 10+ hours per week with ${cleanTitle.slice(0, 25)}. Get early priority onboarding.`.slice(0, 90),
        `Designed for modern teams seeking velocity without bloated software costs. Reserve now.`.slice(0, 90),
      ],
      callToAction: "Visit Landing Page",
      recommendedAudience: "Google Search intent matching high-value keywords",
      estimatedCpc: 2.80,
    },
    // Google Search Ads (RSAs) - Angle 2: Best Alternative
    {
      id: "google-angle-2",
      platform: "google",
      angle: "Software Alternative",
      headline: `Best ${cleanTitle.slice(0, 20)} Software`,
      description: `Replace bloated enterprise tools. Try the streamlined, modern alternative today.`,
      displayPath: `${cleanSlug.slice(0, 15)}/demo`,
      headlines: [
        `Best Modern ${cleanTitle.slice(0, 15)}`.slice(0, 30),
        `Simple, Fast & Reliable`.slice(0, 30),
        `Private Beta Cohort Live`.slice(0, 30),
      ],
      descriptions: [
        `Tired of complex setups? ${cleanTitle.slice(0, 25)} works out of the box in 5 minutes.`.slice(0, 90),
        `Lock in 50% lifetime founding discount pricing before general public release.`.slice(0, 90),
      ],
      callToAction: "Sign Up Today",
      recommendedAudience: "Competitor and category software search queries",
      estimatedCpc: 3.10,
    },

    // X / Twitter Ads - Angle 1: Tech & Founder Audience
    {
      id: "twitter-angle-1",
      platform: "twitter",
      angle: "Founder / Indie Velocity",
      headline: `The missing tool for ${cleanTitle.slice(0, 25)}`,
      description: `Built for speed-obsessed founders.`,
      primaryText: `Most teams waste hours every single week on manual reporting and data juggling.\n\nWe built ${cleanTitle} to fix that in one click:\n\n⚡ 5x faster turnaround\n🎯 0 manual copy-pasting\n🔒 100% data integrity\n\nOpening 50 slots for early beta testers today 👇`,
      callToAction: "Join Waitlist",
      recommendedAudience: "Tech founders, early adopters, indie makers",
      estimatedCpc: 1.40,
    },
  ];

  return {
    conceptTitle: cleanTitle,
    targetAudience: cleanAudience,
    variations,
    targetingBlueprint: {
      targetJobTitles: [
        "Head of Operations",
        "Operations Manager",
        "Founder & CEO",
        "VP of Product",
        "Engineering Manager",
      ],
      recommendedKeywords: [
        `[${cleanTitle.toLowerCase()} tool]`,
        `"${cleanTitle.toLowerCase()} alternative"`,
        `best software for ${cleanTitle.toLowerCase()}`,
        `automated ${cleanTitle.toLowerCase()} platform`,
        `${cleanTitle.toLowerCase()} software for teams`,
      ],
      negativeKeywords: [
        "free",
        "cracked",
        "open source github",
        "jobs",
        "internship",
        "salary",
        "pdf download",
      ],
      estimatedPlatformCpc: {
        meta: 1.20,
        linkedin: 4.80,
        google: 2.90,
        twitter: 1.40,
      },
    },
  };
}

async function generateAdCampaignWithLLM(
  title: string,
  positioning: string,
  targetAudience: string,
  slug: string
): Promise<AdCampaignResponse | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `You are a world-class growth marketing director and performance ad copywriter.
Create a high-converting multi-channel ad campaign kit for this validated startup concept:
- Concept Name: "${title}"
- Positioning / Angle: "${positioning}"
- Target Audience: "${targetAudience}"
- Landing Page Slug: "${slug}"

Generate copy variations for:
1. Meta Ads (2 variations: one Pain Point Agitation, one Speed/ROI)
2. LinkedIn Ads (2 variations: one Executive ROI, one Governance/Scale)
3. Google Search Ads (2 variations: each MUST have 3 headlines ≤ 30 chars each and 2 descriptions ≤ 90 chars each, plus a display path)
4. X / Twitter Ads (1 variation: punchy tweet copy with hook and bullet points)

Output JSON conforming strictly to this format:
{
  "conceptTitle": "${title}",
  "targetAudience": "${targetAudience}",
  "variations": [
    {
      "id": "string",
      "platform": "meta" | "linkedin" | "google" | "twitter",
      "angle": "string",
      "headline": "string (<= 40 chars for meta, <= 70 chars for linkedin)",
      "description": "string",
      "primaryText": "string (for meta, linkedin, twitter)",
      "displayPath": "string (for google)",
      "headlines": ["string (<= 30 chars)", "string (<= 30 chars)", "string (<= 30 chars)"],
      "descriptions": ["string (<= 90 chars)", "string (<= 90 chars)"],
      "callToAction": "string",
      "recommendedAudience": "string",
      "estimatedCpc": number
    }
  ],
  "targetingBlueprint": {
    "targetJobTitles": ["string"],
    "recommendedKeywords": ["string"],
    "negativeKeywords": ["string"],
    "estimatedPlatformCpc": { "meta": 1.2, "linkedin": 4.8, "google": 2.9, "twitter": 1.4 }
  }
}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.7,
        messages: [
          { role: "system", content: "You are a master performance copywriter. Output valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as AdCampaignResponse;
    if (parsed.variations && Array.isArray(parsed.variations) && parsed.variations.length > 0) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn("LLM ad campaign generator error, falling back to heuristic:", err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getAuthenticatedWorkspace(request);
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { experimentId, landingPageId } = body;

    let conceptTitle = body.conceptTitle || "";
    let positioning = body.positioning || "";
    let targetAudience = body.targetAudience || "";
    let slug = body.slug || "";

    // If an experimentId or landingPageId was supplied, fetch context from database
    if (landingPageId) {
      const page = await prisma.landingPage.findUnique({
        where: { id: landingPageId },
        include: { experiment: true },
      });
      if (page) {
        conceptTitle = conceptTitle || page.name || page.headline;
        positioning = positioning || page.positioning;
        slug = slug || page.slug;
      }
    } else if (experimentId) {
      const exp = await prisma.experiment.findUnique({
        where: { id: experimentId },
        include: { landingPages: true },
      });
      if (exp) {
        conceptTitle = conceptTitle || exp.name;
        targetAudience = targetAudience || (exp as any).targetPersona || "";
        if (exp.landingPages?.length > 0) {
          slug = slug || exp.landingPages[0].slug;
          positioning = positioning || exp.landingPages[0].positioning;
        }
      }
    }

    if (!conceptTitle) {
      conceptTitle = "Workflow Automation Platform";
    }
    if (!positioning) {
      positioning = "Save 10+ hours per week with automated workflow intelligence";
    }
    if (!targetAudience) {
      targetAudience = "Operations Leaders, Startup Founders, and Engineering Managers";
    }

    // Attempt LLM generation first, fallback to robust heuristic
    const generated =
      (await generateAdCampaignWithLLM(conceptTitle, positioning, targetAudience, slug)) ||
      generateHeuristicAdCampaign(conceptTitle, positioning, targetAudience, slug);

    return NextResponse.json({
      success: true,
      data: generated,
    });
  } catch (error) {
    console.error("Error generating ad campaign kit:", error);
    return NextResponse.json({ error: "Failed to generate ad campaign kit" }, { status: 500 });
  }
}
