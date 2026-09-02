import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import OnboardingPage from "@/app/onboarding/page";
import { useWizardStore } from "@/lib/store";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

describe("OnboardingPage", () => {
  beforeEach(() => {
    useWizardStore.getState().reset();
  });

  it("renders step 1 heading", () => {
    render(<OnboardingPage />);
    expect(screen.getByText("Your Product")).toBeTruthy();
  });

  it("renders Next button", () => {
    render(<OnboardingPage />);
    expect(screen.getByText("Next")).toBeTruthy();
  });

  it("navigates to step 2 on Next click", () => {
    render(<OnboardingPage />);
    fireEvent.click(screen.getByText("Next"));
    expect(useWizardStore.getState().step).toBe(2);
  });

  it("step 5 renders audience config fields (task #13 regression)", () => {
    useWizardStore.getState().setStep(5);
    render(<OnboardingPage />);
    expect(screen.getByText("Job Title")).toBeTruthy();
    expect(screen.getByText("Industry")).toBeTruthy();
    expect(screen.getByText("Company Size")).toBeTruthy();
  });

  it("audience fields update audienceConfig in store", () => {
    useWizardStore.getState().setStep(5);
    render(<OnboardingPage />);
    const jobInput = screen.getByPlaceholderText("e.g., Operations Manager");
    fireEvent.change(jobInput, { target: { value: "Product Manager" } });
    expect(useWizardStore.getState().audienceConfig.jobTitle).toBe("Product Manager");
  });
});
