import { describe, it, expect } from "vitest";
import { demoLandingPages } from "@/lib/mock-data";
import type { LandingPage } from "@/lib/types";

// ---------------------------------------------------------------------------
// Mock-data integrity tests
// ---------------------------------------------------------------------------

describe("demoLandingPages", () => {
  it("contains 6 landing pages", () => {
    expect(demoLandingPages).toHaveLength(6);
  });

  it("every page has required fields", () => {
    const required: (keyof LandingPage)[] = [
      "id",
      "projectId",
      "name",
      "template",
      "headline",
      "subheadline",
      "cta",
      "status",
      "slug",
      "visitors",
      "conversions",
      "conversionRate",
      "bounceRate",
      "avgTimeOnPage",
      "createdAt",
      "updatedAt",
    ];

    for (const page of demoLandingPages) {
      for (const field of required) {
        expect(page[field], `${page.id} missing field: ${field}`).toBeDefined();
      }
    }
  });

  it("every page has a unique id", () => {
    const ids = demoLandingPages.map((lp) => lp.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every page has a unique slug", () => {
    const slugs = demoLandingPages.map((lp) => lp.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("slugs are URL-safe (lowercase, hyphens, alphanumeric)", () => {
    for (const page of demoLandingPages) {
      expect(page.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("templates are valid", () => {
    const validTemplates = ["hero", "problem", "social-proof", "pricing", "minimal"];
    for (const page of demoLandingPages) {
      expect(validTemplates).toContain(page.template);
    }
  });

  it("statuses are valid", () => {
    const validStatuses = ["live", "paused", "draft"];
    for (const page of demoLandingPages) {
      expect(validStatuses).toContain(page.status);
    }
  });

  it("conversionRate is approximately visitors/conversions ratio", () => {
    for (const page of demoLandingPages) {
      if (page.visitors > 0) {
        const expected = (page.conversions / page.visitors) * 100;
        expect(page.conversionRate).toBeGreaterThanOrEqual(expected - 0.5);
        expect(page.conversionRate).toBeLessThanOrEqual(expected + 0.5);
      }
    }
  });

  it("dates are valid ISO-ish format (YYYY-MM-DD)", () => {
    for (const page of demoLandingPages) {
      expect(page.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(page.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
