import { describe, it, expect } from "vitest";
import { wilsonCI, significance, sampleSize, formatPValue } from "@/lib/stats";

describe("stats — Wilson CI", () => {
  it("returns p=0 for zero visitors", () => {
    expect(wilsonCI(0, 0).p).toBe(0);
  });
  it("wraps observed proportion inside interval", () => {
    const ci = wilsonCI(71, 621); // Variant B 11.4%
    expect(ci.lower).toBeLessThan(ci.p);
    expect(ci.upper).toBeGreaterThan(ci.p);
    expect(ci.lower).toBeGreaterThanOrEqual(0);
    expect(ci.upper).toBeLessThanOrEqual(1);
  });
});

describe("stats — significance", () => {
  it("detects significant difference for clear winner", () => {
    const res = significance({ visitors: 604, conversions: 37, p: 37/604 }, { visitors: 621, conversions: 71, p: 71/621 });
    expect(res.pValue).toBeLessThan(0.05);
    expect(res.significant).toBe(true);
    expect(res.lift).toBeGreaterThan(0);
  });
  it("not significant for close variants", () => {
    const res = significance({ visitors: 605, conversions: 60, p: 60/605 }, { visitors: 610, conversions: 62, p: 62/610 });
    expect(res.significant).toBe(false);
  });
  it("handles zero visitors gracefully", () => {
    const res = significance({ visitors: 0, conversions: 0, p: 0 }, { visitors: 100, conversions: 10, p: 0.1 });
    expect(res.pValue).toBe(1);
  });
  it("formatPValue thresholds", () => {
    expect(formatPValue(0.0004)).toBe("p<0.001");
    expect(formatPValue(0.023456)).toBe("p=0.023");
  });
});

describe("stats — sampleSize", () => {
  it("returns positive number for different proportions", () => {
    const n = sampleSize(0.06, 0.11);
    expect(n).toBeGreaterThan(0);
  });
  it("returns 0 for identical proportions", () => {
    expect(sampleSize(0.1, 0.1)).toBe(0);
  });
});
