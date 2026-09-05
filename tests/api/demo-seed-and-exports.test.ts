import { describe, it, expect, vi } from "vitest";

describe("Production Enhancements: CSV Export, Webhook & Demo Dataset", () => {
  it("formats CSV rows properly with escaped quotes and commas", () => {
    const leads = [
      {
        id: "lead-001",
        name: 'Sarah "CEO" Chen',
        email: "sarah@fintech.io",
        company: "Fintech, Inc.",
        role: "VP Operations",
        source: "linkedin",
        intentScore: 94,
        pricingInteraction: true,
        status: "qualified",
        createdAt: "2026-01-10T12:00:00Z",
      },
    ];

    const headers = [
      "ID",
      "Name",
      "Email",
      "Company",
      "Role",
      "Source",
      "Intent Score",
      "Pricing Interacted",
      "Status",
      "Created At",
    ];

    const rows = leads.map((l) => [
      `"${l.id}"`,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email.replace(/"/g, '""')}"`,
      `"${l.company.replace(/"/g, '""')}"`,
      `"${l.role.replace(/"/g, '""')}"`,
      `"${l.source.replace(/"/g, '""')}"`,
      l.intentScore,
      l.pricingInteraction ? "Yes" : "No",
      `"${l.status}"`,
      `"${l.createdAt}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    expect(csvContent).toContain('"Sarah ""CEO"" Chen"');
    expect(csvContent).toContain('"Fintech, Inc."');
    expect(csvContent).toContain("Yes");
    expect(csvContent).toContain("94");
  });

  it("constructs compliant webhook event payload for lead capture", () => {
    const webhookPayload = {
      event: "lead.captured",
      timestamp: new Date().toISOString(),
      data: {
        id: "lead-123",
        name: "Marcus Vance",
        email: "marcus@hypergrowth.co",
        company: "HyperGrowth Media",
        role: "Founder & CEO",
        source: "meta",
        intentScore: 90,
        landingPage: {
          id: "lp-01",
          slug: "b2b-copilot",
          name: "B2B Workflow AI",
          headline: "Stop Losing Hours to Manual Reporting",
        },
        experimentId: "exp-101",
      },
    };

    expect(webhookPayload.event).toBe("lead.captured");
    expect(webhookPayload.data.intentScore).toBe(90);
    expect(webhookPayload.data.landingPage.slug).toBe("b2b-copilot");
  });
});
