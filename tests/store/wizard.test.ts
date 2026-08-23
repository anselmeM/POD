import { describe, it, expect, beforeEach } from "vitest";
import { useWizardStore } from "@/lib/store";

describe("useWizardStore", () => {
  beforeEach(() => {
    useWizardStore.getState().reset();
  });

  it("starts at step 1", () => {
    expect(useWizardStore.getState().step).toBe(1);
  });

  it("nextStep increments step (max 6)", () => {
    useWizardStore.getState().nextStep();
    expect(useWizardStore.getState().step).toBe(2);
    useWizardStore.getState().nextStep();
    expect(useWizardStore.getState().step).toBe(3);
    // go to max
    for (let i = 3; i < 6; i++) useWizardStore.getState().nextStep();
    expect(useWizardStore.getState().step).toBe(6);
    useWizardStore.getState().nextStep();
    expect(useWizardStore.getState().step).toBe(6);
  });

  it("prevStep decrements step (min 1)", () => {
    useWizardStore.getState().setStep(3);
    useWizardStore.getState().prevStep();
    expect(useWizardStore.getState().step).toBe(2);
    useWizardStore.getState().prevStep();
    expect(useWizardStore.getState().step).toBe(1);
    useWizardStore.getState().prevStep();
    expect(useWizardStore.getState().step).toBe(1);
  });

  it("setStep sets step directly", () => {
    useWizardStore.getState().setStep(4);
    expect(useWizardStore.getState().step).toBe(4);
  });

  it("updateField updates a string field", () => {
    useWizardStore.getState().updateField("productName", "Test Product");
    expect(useWizardStore.getState().productName).toBe("Test Product");
  });

  it("updateField updates a number field", () => {
    useWizardStore.getState().updateField("budget", 500);
    expect(useWizardStore.getState().budget).toBe(500);
  });

  it("updateField updates audienceConfig with spread merge", () => {
    useWizardStore.getState().updateField("audienceConfig", { jobTitle: "PM" });
    expect(useWizardStore.getState().audienceConfig).toEqual({ jobTitle: "PM" });
    useWizardStore.getState().updateField("audienceConfig", {
      ...useWizardStore.getState().audienceConfig,
      industry: "SaaS",
    });
    expect(useWizardStore.getState().audienceConfig).toEqual({
      jobTitle: "PM",
      industry: "SaaS",
    });
  });

  it("toggleHypothesis adds and removes ids", () => {
    const { toggleHypothesis } = useWizardStore.getState();
    toggleHypothesis("hyp-new");
    expect(useWizardStore.getState().selectedHypotheses).toContain("hyp-new");
    toggleHypothesis("hyp-new");
    expect(useWizardStore.getState().selectedHypotheses).not.toContain("hyp-new");
  });

  it("reset clears all fields to defaults", () => {
    useWizardStore.getState().updateField("productName", "Changed");
    useWizardStore.getState().setStep(4);
    useWizardStore.getState().reset();
    const s = useWizardStore.getState();
    expect(s.step).toBe(1);
    expect(s.productName).toBe("");
    expect(s.selectedHypotheses).toEqual([]);
    expect(s.audienceConfig).toEqual({});
    expect(s.budget).toBe(100);
    expect(s.channel).toEqual([]);
  });
});
