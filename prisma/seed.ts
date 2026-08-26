import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Demo user + workspace (for auth)
  const hashedPassword = await bcrypt.hash("demo12345", 10);
  const demoUser = await prisma.user.upsert({
    where: { email: "alex@example.com" },
    update: { name: "Alex Morgan", password: hashedPassword },
    create: {
      name: "Alex Morgan",
      email: "alex@example.com",
      password: hashedPassword,
    },
  });
  console.log(`  ✅ User: ${demoUser.email}`);

  const workspace = await prisma.workspace.upsert({
    where: { id: "ws-001" },
    update: { name: "Acme Inc.", plan: "trial", ownerId: demoUser.id },
    create: { id: "ws-001", name: "Acme Inc.", plan: "trial", ownerId: demoUser.id },
  });
  console.log(`  ✅ Workspace: ${workspace.name}`);

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: demoUser.id } },
    update: { role: "owner" },
    create: { workspaceId: workspace.id, userId: demoUser.id, role: "owner" },
  });
  console.log(`  ✅ Membership: ${demoUser.email} → ${workspace.name} (owner)`);

  // Project
  const project = await prisma.project.upsert({
    where: { id: "proj-001" },
    update: {},
    create: {
      id: "proj-001",
      workspaceId: "ws-001",
      name: "AI Reporting Copilot",
      description: "An AI assistant that automatically prepares weekly operational reports for growing SaaS teams.",
      status: "testing",
      podScore: 78,
      confidence: 84,
    },
  });
  console.log(`  ✅ Project: ${project.name}`);

  // Experiments
  const experiments = [
    { id: "EXP-2048", projectId: "proj-001", name: "Time-Savings Positioning", status: "running", budget: 100, channel: JSON.stringify(["linkedin", "meta"]), startDate: new Date("2026-01-10"), traffic: 1842, conversions: 159, conversionRate: 8.7, highIntentActions: 98, highIntentRate: 6.9, costPerAction: 3.31 },
    { id: "EXP-2041", projectId: "proj-001", name: "Problem-Aware Messaging", status: "completed", budget: 100, channel: JSON.stringify(["linkedin"]), startDate: new Date("2025-12-20"), endDate: new Date("2026-01-05"), traffic: 1230, conversions: 89, conversionRate: 7.2, highIntentActions: 52, highIntentRate: 5.8, costPerAction: 3.92 },
    { id: "EXP-2035", projectId: "proj-001", name: "Pricing Sensitivity", status: "running", budget: 100, channel: JSON.stringify(["meta", "google"]), startDate: new Date("2026-01-12"), traffic: 524, conversions: 36, conversionRate: 6.9, highIntentActions: 22, highIntentRate: 5.1, costPerAction: 4.12 },
  ];

  for (const exp of experiments) {
    await prisma.experiment.upsert({ where: { id: exp.id }, update: exp, create: exp });
    console.log(`  ✅ Experiment: ${exp.name}`);
  }

  // Variants
  const variants = [
    // EXP-2048 variants
    { id: "var-001", experimentId: "EXP-2048", name: "Variant A", headline: "Stop Losing Hours to Manual Reporting", subheadline: "AI-generated weekly reports in minutes, not days.", positioning: "Time savings", cta: "Get Early Access", trafficAllocation: 33, visitors: 604, conversions: 37, conversionRate: 6.2, highIntent: 19, costPerAction: 4.8 },
    { id: "var-002", experimentId: "EXP-2048", name: "Variant B", headline: "Reduce Weekly Reporting Time by 50%", subheadline: "Your AI copilot for operational reporting.", positioning: "Automation + time savings", cta: "Start Free Trial", trafficAllocation: 34, visitors: 621, conversions: 71, conversionRate: 11.4, highIntent: 48, costPerAction: 2.71 },
    { id: "var-003", experimentId: "EXP-2048", name: "Variant C", headline: "Get Your Weekly Numbers in Minutes", subheadline: "AI-powered reports from your existing tools.", positioning: "Speed + simplicity", cta: "See How It Works", trafficAllocation: 33, visitors: 617, conversions: 51, conversionRate: 8.3, highIntent: 31, costPerAction: 3.41 },
    // EXP-2041 variants
    { id: "var-004", experimentId: "EXP-2041", name: "Variant A", headline: "Reporting Shouldn't Take All Week", subheadline: "", positioning: "Pain-focused", cta: "Learn More", trafficAllocation: 33, visitors: 412, conversions: 31, conversionRate: 7.5, highIntent: 18, costPerAction: 4.12 },
    { id: "var-005", experimentId: "EXP-2041", name: "Variant B", headline: "Your Team Deserves Better Data", subheadline: "", positioning: "Outcome-focused", cta: "Get Started", trafficAllocation: 34, visitors: 401, conversions: 38, conversionRate: 9.5, highIntent: 24, costPerAction: 3.29 },
    { id: "var-006", experimentId: "EXP-2041", name: "Variant C", headline: "Automated Reports for Growing Teams", subheadline: "", positioning: "Solution-focused", cta: "Try Free", trafficAllocation: 33, visitors: 398, conversions: 29, conversionRate: 7.3, highIntent: 15, costPerAction: 4.51 },
    // EXP-2035 variants
    { id: "var-007", experimentId: "EXP-2035", name: "Variant A", headline: "AI Reporting for $49/Month", subheadline: "", positioning: "Lower price anchor", cta: "Start Free Trial", trafficAllocation: 50, visitors: 284, conversions: 22, conversionRate: 7.7, highIntent: 16, costPerAction: 2.86 },
    { id: "var-008", experimentId: "EXP-2035", name: "Variant B", headline: "AI Reporting for $99/Month", subheadline: "", positioning: "Premium price anchor", cta: "Start Free Trial", trafficAllocation: 50, visitors: 240, conversions: 14, conversionRate: 5.8, highIntent: 13, costPerAction: 3.93 },
  ];

  for (const v of variants) {
    await prisma.variant.upsert({ where: { id: v.id }, update: v, create: v });
    console.log(`  ✅ Variant: ${v.name} (${v.experimentId})`);
  }

  // Leads
  const leads = [
    { id: "lead-001", experimentId: "EXP-2048", variantId: "var-002", name: "Sarah Chen", email: "sarah.chen@scaleops.io", company: "ScaleOps", role: "VP of Operations", source: "LinkedIn", intentScore: 92, pricingInteraction: true, status: "new", events: JSON.stringify(["page_view", "cta_click", "pricing_view", "pricing_toggle", "form_submit"]), createdAt: new Date("2026-01-14T14:22:00Z") },
    { id: "lead-002", experimentId: "EXP-2048", variantId: "var-002", name: "Marcus Rodriguez", email: "marcus@growthlane.com", company: "GrowthLane", role: "Head of Ops", source: "Meta", intentScore: 87, pricingInteraction: true, status: "contacted", events: JSON.stringify(["page_view", "scroll", "cta_click", "pricing_view", "pricing_toggle"]), createdAt: new Date("2026-01-13T09:45:00Z") },
    { id: "lead-003", experimentId: "EXP-2048", variantId: "var-001", name: "Priya Patel", email: "priya@cloudnine.io", company: "CloudNine", role: "Operations Manager", source: "LinkedIn", intentScore: 74, pricingInteraction: false, status: "new", events: JSON.stringify(["page_view", "scroll", "cta_click", "form_submit"]), createdAt: new Date("2026-01-14T16:10:00Z") },
    { id: "lead-004", experimentId: "EXP-2048", variantId: "var-003", name: "David Kim", email: "david.kim@nexustech.co", company: "NexusTech", role: "CEO", source: "Meta", intentScore: 68, pricingInteraction: true, status: "qualified", events: JSON.stringify(["page_view", "cta_click", "pricing_view"]), createdAt: new Date("2026-01-12T11:30:00Z") },
    { id: "lead-005", experimentId: "EXP-2048", variantId: "var-002", name: "Emily Watson", email: "emily.w@streamlinehq.com", company: "Streamline", role: "COO", source: "LinkedIn", intentScore: 81, pricingInteraction: true, status: "new", events: JSON.stringify(["page_view", "scroll", "cta_click", "pricing_view", "pricing_toggle", "form_submit"]), createdAt: new Date("2026-01-15T08:15:00Z") },
    { id: "lead-006", experimentId: "EXP-2041", variantId: "var-005", name: "James Liu", email: "james@datafirst.co", company: "DataFirst", role: "Founder", source: "LinkedIn", intentScore: 55, pricingInteraction: false, status: "disqualified", events: JSON.stringify(["page_view", "scroll"]), createdAt: new Date("2026-01-02T10:00:00Z") },
    { id: "lead-007", experimentId: "EXP-2048", variantId: "var-002", name: "Rachel Torres", email: "rachel@pivotops.com", company: "PivotOps", role: "Director of Operations", source: "Meta", intentScore: 89, pricingInteraction: true, status: "contacted", events: JSON.stringify(["page_view", "cta_click", "pricing_view", "pricing_toggle", "form_submit"]), createdAt: new Date("2026-01-14T13:55:00Z") },
    { id: "lead-008", experimentId: "EXP-2035", variantId: "var-007", name: "Tom Bradley", email: "tom.b@acmecorp.com", company: "Acme Corp", role: "Product Manager", source: "LinkedIn", intentScore: 61, pricingInteraction: true, status: "new", events: JSON.stringify(["page_view", "scroll", "pricing_view"]), createdAt: new Date("2026-01-15T07:20:00Z") },
  ];

  for (const lead of leads) {
    await prisma.lead.upsert({ where: { id: lead.id }, update: lead, create: lead });
    console.log(`  ✅ Lead: ${lead.name}`);
  }

  // Landing Pages
  const pages = [
    { id: "lp-001", projectId: "proj-001", name: "Variant A — Time Savings", template: "hero", headline: "Stop Losing Hours to Manual Reporting", subheadline: "AI-generated weekly reports in minutes, not days.", cta: "Get Early Access", positioning: "Time Savings", status: "live", experimentId: "EXP-2048", slug: "variant-a-time-savings", visitors: 604, conversions: 37, conversionRate: 6.2, bounceRate: 42, avgTimeOnPage: 48, createdAt: new Date("2026-01-10"), updatedAt: new Date("2026-01-16") },
    { id: "lp-002", projectId: "proj-001", name: "Variant B — Automation", template: "problem", headline: "Reduce Weekly Reporting Time by 50%", subheadline: "Your AI copilot for operational reporting.", cta: "Start Free Trial", positioning: "Automation + Time Savings", status: "live", experimentId: "EXP-2048", slug: "variant-b-automation", visitors: 621, conversions: 71, conversionRate: 11.4, bounceRate: 31, avgTimeOnPage: 72, createdAt: new Date("2026-01-10"), updatedAt: new Date("2026-01-16") },
    { id: "lp-003", projectId: "proj-001", name: "Variant C — Speed", template: "minimal", headline: "Get Your Weekly Numbers in Minutes", subheadline: "AI-powered reports from your existing tools.", cta: "See How It Works", positioning: "Speed + Simplicity", status: "paused", experimentId: "EXP-2048", slug: "variant-c-speed", visitors: 617, conversions: 51, conversionRate: 8.3, bounceRate: 36, avgTimeOnPage: 58, createdAt: new Date("2026-01-10"), updatedAt: new Date("2026-01-14") },
    { id: "lp-004", projectId: "proj-001", name: "Problem-Aware A", template: "problem", headline: "Reporting Shouldn't Take All Week", subheadline: "Automate your operational reports with AI.", cta: "Learn More", positioning: "Pain Point", status: "paused", experimentId: "EXP-2041", slug: "problem-aware-a", visitors: 412, conversions: 31, conversionRate: 7.5, bounceRate: 45, avgTimeOnPage: 39, createdAt: new Date("2025-12-20"), updatedAt: new Date("2026-01-10") },
    { id: "lp-005", projectId: "proj-001", name: "Pricing Test — $49", template: "pricing", headline: "AI Reporting for $49/Month", subheadline: "Full-featured operational reports at an affordable price.", cta: "Start Free Trial", positioning: "Pricing", status: "live", experimentId: "EXP-2035", slug: "pricing-test-49", visitors: 284, conversions: 22, conversionRate: 7.7, bounceRate: 38, avgTimeOnPage: 65, createdAt: new Date("2026-01-12"), updatedAt: new Date("2026-01-16") },
    { id: "lp-006", projectId: "proj-001", name: "Pricing Test — $99", template: "pricing", headline: "AI Reporting for $99/Month", subheadline: "Enterprise-grade operational reports for growing teams.", cta: "Start Free Trial", positioning: "Pricing", status: "live", experimentId: "EXP-2035", slug: "pricing-test-99", visitors: 240, conversions: 14, conversionRate: 5.8, bounceRate: 48, avgTimeOnPage: 52, createdAt: new Date("2026-01-12"), updatedAt: new Date("2026-01-16") },
  ];

  for (const lp of pages) {
    await prisma.landingPage.upsert({ where: { id: lp.id }, update: lp, create: lp });
    console.log(`  ✅ Landing Page: ${lp.name}`);
  }

  // Signal Events
  const signalEvents = [
    { id: "evt-001", experimentId: "EXP-2048", visitorId: "vis-8821", eventType: "checkout_initiate", variantId: "var-002", metadata: JSON.stringify({ description: "Started checkout flow" }), timestamp: new Date("2026-01-16T14:32:12Z") },
    { id: "evt-002", experimentId: "EXP-2048", visitorId: "vis-7734", eventType: "pricing_toggle", variantId: "var-002", metadata: JSON.stringify({ description: "Toggled annual/monthly" }), timestamp: new Date("2026-01-16T14:28:45Z") },
    { id: "evt-003", experimentId: "EXP-2048", visitorId: "vis-6612", eventType: "form_submit", variantId: "var-002", metadata: JSON.stringify({ description: "Email captured" }), timestamp: new Date("2026-01-16T14:25:03Z") },
    { id: "evt-004", experimentId: "EXP-2048", visitorId: "vis-5598", eventType: "pricing_view", variantId: "var-003", metadata: JSON.stringify({ description: "Viewed pricing section" }), timestamp: new Date("2026-01-16T14:22:18Z") },
    { id: "evt-005", experimentId: "EXP-2048", visitorId: "vis-4421", eventType: "cta_click", variantId: "var-001", metadata: JSON.stringify({ description: "Clicked Get Early Access" }), timestamp: new Date("2026-01-16T14:18:30Z") },
    { id: "evt-006", experimentId: "EXP-2048", visitorId: "vis-3387", eventType: "demo_request", variantId: "var-002", metadata: JSON.stringify({ description: "Requested product demo" }), timestamp: new Date("2026-01-16T14:15:02Z") },
    { id: "evt-007", experimentId: "EXP-2048", visitorId: "vis-2254", eventType: "scroll", variantId: "var-003", metadata: JSON.stringify({ description: "Scrolled 85% of page" }), timestamp: new Date("2026-01-16T14:12:44Z") },
    { id: "evt-008", experimentId: "EXP-2048", visitorId: "vis-1198", eventType: "page_view", variantId: "var-001", metadata: JSON.stringify({ description: "Landed from LinkedIn ad" }), timestamp: new Date("2026-01-16T14:08:11Z") },
    { id: "evt-009", experimentId: "EXP-2035", visitorId: "vis-9912", eventType: "pricing_view", variantId: "var-007", metadata: JSON.stringify({ description: "Viewed $49 pricing" }), timestamp: new Date("2026-01-16T14:05:33Z") },
    { id: "evt-010", experimentId: "EXP-2035", visitorId: "vis-8845", eventType: "cta_click", variantId: "var-007", metadata: JSON.stringify({ description: "Clicked Start Free Trial" }), timestamp: new Date("2026-01-16T14:02:19Z") },
  ];

  for (const evt of signalEvents) {
    await prisma.signalEvent.upsert({ where: { id: evt.id }, update: evt, create: evt });
    console.log(`  ✅ Signal Event: ${evt.eventType} (${evt.visitorId})`);
  }

  // AI Insights
  const insights = [
    { id: "ins-001", experimentId: "EXP-2048", type: "variant", title: "Variant B Outperforming on High-Intent Actions", content: "Variant B is generating 2.4x more high-intent interactions than Variant A.", confidence: 87, recommendation: "Shift traffic allocation toward Variant B and test against a higher price point.", evidence: JSON.stringify(["Variant B: 11.4% conversion vs. A: 6.2%", "Variant B: 48 high-intent vs. A: 19", "Pricing interaction rate 2.1x higher on B"]), createdAt: new Date("2026-01-14T10:00:00Z") },
    { id: "ins-002", experimentId: "EXP-2048", type: "demand", title: "Demand Signal: Strong", content: "Consistent high-intent signals suggest real purchase intent.", confidence: 84, recommendation: "Run pricing experiment $49 vs $79 before scaling.", evidence: JSON.stringify(["84% validation confidence", "6.9% high-intent rate", "Consistent conversion across 3 variants"]), createdAt: new Date("2026-01-14T10:30:00Z") },
    { id: "ins-003", experimentId: "EXP-2048", type: "audience", title: "Operations Leaders Responding Strongest", content: "Ops leaders have 3.2x higher high-intent rate than general audience.", confidence: 79, recommendation: "Create dedicated experiment targeting ops leaders.", evidence: JSON.stringify(["Ops leaders: 14.2% conversion", "General: 4.4% conversion", "Ops leaders: 68% of pricing interactions"]), createdAt: new Date("2026-01-13T15:00:00Z") },
    { id: "ins-004", experimentId: "EXP-2048", type: "pricing", title: "Pricing Signal: Moderate", content: "Meaningful purchase intent but insufficient sample for WTP threshold.", confidence: 68, recommendation: "Test $49 vs $79 with winning positioning.", evidence: JSON.stringify(["$49: 7.7% conversion", "$99: 5.8% conversion", "Below significance threshold"]), createdAt: new Date("2026-01-14T11:00:00Z") },
  ];

  for (const insight of insights) {
    await prisma.aIInsight.upsert({ where: { id: insight.id }, update: insight, create: insight });
    console.log(`  ✅ AI Insight: ${insight.title}`);
  }

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
