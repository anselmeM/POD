import { describe, it, expect } from "vitest";
import { EXPERIMENT_TEMPLATES } from "@/lib/experiment-templates";

describe("experiment-templates", () => {
  it("has 4 presets", () => {
    expect(EXPERIMENT_TEMPLATES).toHaveLength(4);
  });
  it("each preset has valid allocation sum 100", () => {
    for (const tpl of EXPERIMENT_TEMPLATES) {
      const sum = tpl.variants.reduce((s, v) => s + v.trafficAllocation, 0);
      expect(sum).toBe(100);
    }
  });
  it("pricing template has 3 price-anchored variants", () => {
    const pricing = EXPERIMENT_TEMPLATES.find((t) => t.id === "pricing")!;
    expect(pricing.variants.map((v) => v.headline).join(" ")).toMatch(/\$49/);
  });
});
