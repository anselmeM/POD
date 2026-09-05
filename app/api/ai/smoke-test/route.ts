import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedWorkspace } from "@/lib/workspace";

interface SmokeTestGenerated {
  conceptTitle: string;
  targetPersona: string;
  coreFriction: string;
  slug: string;
  variantA: {
    name: string;
    positioning: string;
    headline: string;
    subheadline: string;
    cta: string;
  };
  variantB: {
    name: string;
    positioning: string;
    headline: string;
    subheadline: string;
    cta: string;
  };
}

function synthesizeHeuristicSmokeTest(prompt: string): SmokeTestGenerated {
  const clean = prompt.trim();
  const slugBase = clean
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 30);
  const randomSuffix = Math.random().toString(36).slice(2, 6);
  const slug = `${slugBase || "smoke-test"}-${randomSuffix}`;

  // Capitalize words for title
  const conceptTitle = clean
    .split(" ")
    .slice(0, 6)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    conceptTitle,
    targetPersona: `Early adopters, founders, and engineering leaders seeking: ${clean}`,
    coreFriction: `Current manual workflows for "${clean}" cause unnecessary bottlenecks, delays, and context-switching.`,
    slug,
    variantA: {
      name: "Speed & Velocity",
      positioning: "Speed & Productivity",
      headline: `${conceptTitle} — 5x Faster Workflow Automation`,
      subheadline: `Eliminate manual friction and save hours each week with intelligent automation tailored for ${clean.toLowerCase()}.`,
      cta: "Reserve Early Access",
    },
    variantB: {
      name: "Quality & Assurance",
      positioning: "Risk Reduction & Quality",
      headline: `The High-Reliability Platform for ${conceptTitle}`,
      subheadline: `Ensure zero missed details and bulletproof execution with enterprise-grade safeguards and seamless integrations.`,
      cta: "Join Founding Cohort",
    },
  };
}

async function generateWithLLM(prompt: string): Promise<SmokeTestGenerated | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
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
          {
            role: "system",
            content: `You are a world-class growth engineer and startup validator. Given a 1-sentence startup concept, generate a structured smoke test experiment with 2 contrasting positioning variants (e.g. Speed/Productivity vs Quality/Security), target persona, and an SEO slug.
Output valid JSON with the exact schema:
{
  "conceptTitle": "string",
  "targetPersona": "string",
  "coreFriction": "string",
  "slug": "kebab-case-string",
  "variantA": {
    "name": "string",
    "positioning": "string",
    "headline": "string",
    "subheadline": "string",
    "cta": "string"
  },
  "variantB": {
    "name": "string",
    "positioning": "string",
    "headline": "string",
    "subheadline": "string",
    "cta": "string"
  }
}`,
          },
          {
            role: "user",
            content: `Generate a smoke test experiment for: "${prompt}"`,
          },
        ],
      }),
    });

    if (!res.ok) return null;
    const json = await res.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as SmokeTestGenerated;
    if (!parsed.variantA || !parsed.variantB || !parsed.variantA.headline) {
      return null;
    }
    const randomSuffix = Math.random().toString(36).slice(2, 6);
    parsed.slug = `${(parsed.slug || "smoke").replace(/[^a-z0-9]+/g, "-")}-${randomSuffix}`;
    return parsed;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      prompt,
      projectId: explicitProjectId,
      enablePreorder = false,
      depositAmount = 100,
    } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: "Please enter a concept description (at least 3 characters)" },
        { status: 400 }
      );
    }

    // Resolve caller's workspace or fallback to default
    const ctx = await getAuthenticatedWorkspace(request);
    let workspaceId = ctx?.workspace?.id;

    if (!workspaceId) {
      const defaultWs = await prisma.workspace.findFirst({
        orderBy: { createdAt: "asc" },
      });
      workspaceId = defaultWs?.id;
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace context could not be resolved" },
        { status: 400 }
      );
    }

    // Resolve or create project
    let projectId = explicitProjectId;
    if (!projectId) {
      const existingProject = await prisma.project.findFirst({
        where: { workspaceId },
        orderBy: { updatedAt: "desc" },
      });
      if (existingProject) {
        projectId = existingProject.id;
      } else {
        const newProj = await prisma.project.create({
          data: {
            workspaceId,
            name: "Demand Validation Lab",
            status: "active",
          },
        });
        projectId = newProj.id;
      }
    }

    // Generate smoke test structure (LLM with heuristic fallback)
    const generated =
      (await generateWithLLM(prompt)) || synthesizeHeuristicSmokeTest(prompt);

    const expShortId = Date.now().toString(36).toUpperCase().slice(-6);
    const expId = `EXP-AI-${expShortId}`;

    // 1. Create Experiment
    const experiment = await prisma.experiment.create({
      data: {
        id: expId,
        projectId,
        name: `${generated.conceptTitle} — AI Smoke Test`,
        status: "running",
        budget: 150,
        channel: JSON.stringify(["LinkedIn Ads", "Direct Referral"]),
        startDate: new Date(),
        traffic: 0,
        conversions: 0,
        highIntentActions: 0,
      },
    });

    // 2. Create 2 Contrasting Variants
    const varAId = `VAR-${expId}-A`;
    const varBId = `VAR-${expId}-B`;

    const variantA = await prisma.variant.create({
      data: {
        id: varAId,
        experimentId: expId,
        name: `Variant A: ${generated.variantA.name}`,
        headline: generated.variantA.headline,
        subheadline: generated.variantA.subheadline,
        positioning: generated.variantA.positioning,
        cta: generated.variantA.cta,
        trafficAllocation: 50,
        visitors: 0,
        conversions: 0,
        highIntent: 0,
      },
    });

    const variantB = await prisma.variant.create({
      data: {
        id: varBId,
        experimentId: expId,
        name: `Variant B: ${generated.variantB.name}`,
        headline: generated.variantB.headline,
        subheadline: generated.variantB.subheadline,
        positioning: generated.variantB.positioning,
        cta: generated.variantB.cta,
        trafficAllocation: 50,
        visitors: 0,
        conversions: 0,
        highIntent: 0,
      },
    });

    // 3. Create Live Landing Page
    const landingPage = await prisma.landingPage.create({
      data: {
        projectId,
        experimentId: expId,
        name: `${generated.conceptTitle} Smoke Page`,
        template: "hero",
        headline: generated.variantA.headline,
        subheadline: generated.variantA.subheadline,
        cta: generated.variantA.cta,
        positioning: generated.variantA.positioning,
        status: "live",
        slug: generated.slug,
        preorderEnabled: Boolean(enablePreorder),
        depositAmount: Number(depositAmount) || 100,
        priceAnchor: 4900,
        visitors: 0,
        conversions: 0,
      },
    });

    // 4. Create Initial AI Hypothesis Insight
    await prisma.aIInsight.create({
      data: {
        id: `INS-${expId}-1`,
        experimentId: expId,
        type: "variant",
        title: "Contrasting Positioning Hypothesis Generated",
        content: `Hypothesis: Variant A (${generated.variantA.positioning}) tests urgency and speed, while Variant B (${generated.variantB.positioning}) tests confidence and risk reduction. Target Persona: ${generated.targetPersona}.`,
        confidence: 94,
        recommendation: `Drive at least 50 targeted visitors across both variants to establish statistical divergence.`,
        evidence: JSON.stringify([
          "Contrasting value propositions configured",
          "50/50 traffic split initialized",
          enablePreorder ? "Pre-order reservation deposit enabled ($1.00)" : "Email waitlist intent modal enabled",
        ]),
      },
    });

    // 5. In-App Notification
    await prisma.notification.create({
      data: {
        workspaceId,
        title: "⚡ Instant AI Smoke Test Deployed",
        message: `Successfully synthesized and deployed "${generated.conceptTitle}" on /p/${generated.slug}`,
        type: "experiment",
      },
    });

    return NextResponse.json(
      {
        success: true,
        experiment,
        variants: [variantA, variantB],
        landingPage,
        slug: generated.slug,
        persona: generated.targetPersona,
        friction: generated.coreFriction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error generating instant AI smoke test:", error);
    return NextResponse.json(
      { error: "Failed to generate instant AI smoke test" },
      { status: 500 }
    );
  }
}
