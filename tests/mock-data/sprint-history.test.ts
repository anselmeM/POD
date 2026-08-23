import { describe, it, expect } from "vitest";
import { demoSprintHistory } from "@/lib/mock-data";

describe("demoSprintHistory", () => {
  it("is a non-empty array", () => {
    expect(demoSprintHistory.length).toBeGreaterThan(0);
  });

  it("each sprint has required fields", () => {
    for (const s of demoSprintHistory) {
      expect(s.id).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(s.startDate).toBeTruthy();
      expect(s.endDate).toBeTruthy();
      expect(typeof s.visitors).toBe("number");
      expect(typeof s.conversions).toBe("number");
      expect(typeof s.conversionRate).toBe("number");
      expect(typeof s.highIntentActions).toBe("number");
      expect(typeof s.leads).toBe("number");
      expect(typeof s.podScore).toBe("number");
      expect(typeof s.confidence).toBe("number");
    }
  });

  it("conversionRate matches conversions/visitors (within 0.2 tolerance)", () => {
    for (const s of demoSprintHistory) {
      const expected = (s.conversions / s.visitors) * 100;
      expect(Math.abs(s.conversionRate - expected)).toBeLessThan(0.2);
    }
  });

  it("all IDs are unique", () => {
    const ids = demoSprintHistory.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("podScore and confidence are in 0-100 range", () => {
    for (const s of demoSprintHistory) {
      expect(s.podScore).toBeGreaterThanOrEqual(0);
      expect(s.podScore).toBeLessThanOrEqual(100);
      expect(s.confidence).toBeGreaterThanOrEqual(0);
      expect(s.confidence).toBeLessThanOrEqual(100);
    }
  });
});
