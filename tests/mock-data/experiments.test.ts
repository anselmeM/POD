import { describe, it, expect } from "vitest";
import { demoExperiments } from "@/lib/mock-data";

const VALID_STATUSES = ["running", "completed", "paused", "draft"];

describe("demoExperiments", () => {
  it("is a non-empty array", () => {
    expect(demoExperiments.length).toBeGreaterThan(0);
  });

  it("each experiment has required fields", () => {
    for (const exp of demoExperiments) {
      expect(exp.id).toBeTruthy();
      expect(exp.name).toBeTruthy();
      expect(exp.status).toBeTruthy();
      expect(typeof exp.budget).toBe("number");
      expect(Array.isArray(exp.channel)).toBe(true);
      expect(exp.startDate).toBeTruthy();
    }
  });

  it("all experiment IDs are unique", () => {
    const ids = demoExperiments.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all statuses are valid", () => {
    for (const exp of demoExperiments) {
      expect(VALID_STATUSES).toContain(exp.status);
    }
  });

  it("each experiment has at least one variant", () => {
    for (const exp of demoExperiments) {
      expect(exp.variants.length).toBeGreaterThan(0);
    }
  });
});
