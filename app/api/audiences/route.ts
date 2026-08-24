import { NextResponse } from "next/server";

/** GET /api/audiences — return audience segments data */
export async function GET() {
  // TODO: Replace with real Prisma query when Audience model is added
  const audience = {
    primarySegment: "Operations Managers at SaaS companies (20-200 employees)",
    jobTitle: "VP of Operations, Head of Ops, Operations Manager",
    industry: "SaaS, B2B Software, Technology",
    companySize: "20-200 employees",
    geography: "United States, Canada, United Kingdom",
    seniority: "Mid-Senior, Director, VP",
    interests: ["Process automation", "Data analytics", "Team productivity", "Reporting tools", "SaaS operations"],
    painPoints: [
      "Spending 4-8 hours weekly on manual reporting",
      "Data scattered across multiple tools",
      "Lack of real-time operational visibility",
      "Reporting errors from manual data aggregation",
    ],
  };

  const segments = [
    { id: "seg-001", name: "Ops Leaders at SaaS", description: "VP/Director of Operations at B2B SaaS companies", reach: 12400, intentScore: 87, status: "active" },
    { id: "seg-002", name: "Startup Founders", description: "Founders of early-stage startups (1-20 employees)", reach: 8200, intentScore: 62, status: "active" },
    { id: "seg-003", name: "Finance Teams", description: "Finance managers at mid-market companies", reach: 6800, intentScore: 54, status: "active" },
    { id: "seg-004", name: "Product Managers", description: "PMs at growth-stage tech companies", reach: 9100, intentScore: 71, status: "active" },
    { id: "seg-005", name: "Agency Owners", description: "Digital agency owners managing client reporting", reach: 4500, intentScore: 48, status: "paused" },
  ];

  return NextResponse.json({ audience, segments });
}
