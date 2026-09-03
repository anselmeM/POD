import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/audiences — return real audience segments data from Prisma */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let projectId = searchParams.get("projectId");

    if (!projectId) {
      const firstProject = await prisma.project.findFirst();
      projectId = firstProject?.id || null;
    }

    if (!projectId) {
      return NextResponse.json({
        audience: null,
        segments: [],
      });
    }

    let audience = await prisma.audience.findUnique({
      where: { projectId },
      include: { segments: { orderBy: { intentScore: "desc" } } },
    });

    // If none exists yet for this project, create an initial tailored audience
    if (!audience) {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      audience = await prisma.audience.create({
        data: {
          projectId,
          primarySegment: project?.name ? `Target Market for ${project.name}` : "Operations Leaders & Product Teams",
          jobTitle: "VP Operations, Head of Product, Founder",
          industry: "B2B SaaS, Technology",
          companySize: "10-250 employees",
          geography: "United States, Europe, Canada",
          seniority: "Director, VP, Executive",
          interests: JSON.stringify(["Process Automation", "Efficiency", "Team Analytics"]),
          painPoints: JSON.stringify([
            project?.description || "Manual operational overhead",
            "Lack of automated reporting",
            "Tool fatigue",
          ]),
          segments: {
            create: [
              { name: "Early Adopters", description: "Tech-forward founders & operators", reach: 8500, intentScore: 84, status: "active" },
              { name: "Growth Stage Ops", description: "Operations leads managing scale", reach: 12400, intentScore: 78, status: "active" },
              { name: "Product Leaders", description: "VPs of Product validating customer needs", reach: 6200, intentScore: 65, status: "active" },
            ],
          },
        },
        include: { segments: true },
      });
    }

    return NextResponse.json({
      audience: {
        id: audience.id,
        primarySegment: audience.primarySegment,
        jobTitle: audience.jobTitle,
        industry: audience.industry,
        companySize: audience.companySize,
        geography: audience.geography,
        seniority: audience.seniority,
        interests: JSON.parse(audience.interests || "[]"),
        painPoints: JSON.parse(audience.painPoints || "[]"),
      },
      segments: audience.segments.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        reach: s.reach,
        intentScore: s.intentScore,
        status: s.status,
      })),
    });
  } catch (error) {
    console.error("Error fetching audiences:", error);
    return NextResponse.json({ error: "Failed to fetch audiences" }, { status: 500 });
  }
}

/** POST /api/audiences — create or update target audience */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, primarySegment, jobTitle, industry, companySize, geography, seniority, interests, painPoints, segments } = body;

    if (!projectId || !primarySegment) {
      return NextResponse.json({ error: "projectId and primarySegment are required" }, { status: 400 });
    }

    const upserted = await prisma.audience.upsert({
      where: { projectId },
      create: {
        projectId,
        primarySegment,
        jobTitle: jobTitle || "",
        industry: industry || "",
        companySize: companySize || "",
        geography: geography || "",
        seniority: seniority || "",
        interests: JSON.stringify(interests || []),
        painPoints: JSON.stringify(painPoints || []),
        segments: Array.isArray(segments) && segments.length > 0 ? {
          create: segments.map((s: any) => ({
            name: s.name,
            description: s.description || "",
            reach: Number(s.reach) || 0,
            intentScore: Number(s.intentScore) || 0,
            status: s.status || "active",
          })),
        } : undefined,
      },
      update: {
        primarySegment,
        jobTitle: jobTitle ?? undefined,
        industry: industry ?? undefined,
        companySize: companySize ?? undefined,
        geography: geography ?? undefined,
        seniority: seniority ?? undefined,
        interests: interests ? JSON.stringify(interests) : undefined,
        painPoints: painPoints ? JSON.stringify(painPoints) : undefined,
      },
      include: { segments: true },
    });

    return NextResponse.json({ data: upserted });
  } catch (error) {
    console.error("Error saving audience:", error);
    return NextResponse.json({ error: "Failed to save audience" }, { status: 500 });
  }
}
