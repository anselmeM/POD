import { describe, it, expect } from "vitest";
import { demoHistoryItems } from "@/lib/mock-data";

describe("demoHistoryItems", () => {
  it("is a non-empty array", () => {
    expect(demoHistoryItems.length).toBeGreaterThan(0);
  });

  it("each item has required HistoryItem fields", () => {
    for (const item of demoHistoryItems) {
      expect(item.id).toBeTruthy();
      expect(item.date).toBeTruthy();
      expect(item.project).toBeTruthy();
      expect(item.verdict).toBeTruthy();
      expect(typeof item.score).toBe("number");
      expect(typeof item.experiments).toBe("number");
      expect(item.status).toBeTruthy();
      expect(item.description).toBeTruthy();
      expect(item.topExperiment).toBeTruthy();
      expect(item.keyInsight).toBeTruthy();
    }
  });

  it("scores are in 0-100 range", () => {
    for (const item of demoHistoryItems) {
      expect(item.score).toBeGreaterThanOrEqual(0);
      expect(item.score).toBeLessThanOrEqual(100);
    }
  });

  it("statuses are valid color tokens", () => {
    const valid = ["green", "amber", "blue", "red"];
    for (const item of demoHistoryItems) {
      expect(valid).toContain(item.status);
    }
  });

  it("all IDs are unique", () => {
    const ids = demoHistoryItems.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
