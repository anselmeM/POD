import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AIAnalystPage from "@/app/dashboard/ai-analyst/page";
import ReportsPage from "@/app/dashboard/reports/page";
import SignalsPage from "@/app/dashboard/signals/page";
import AudiencesPage from "@/app/dashboard/audiences/page";
import SprintPage from "@/app/dashboard/sprint/page";
import LandingPagesPage from "@/app/dashboard/landing-pages/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/dashboard",
}));

describe("Streamline 4-Pillar Validation Suite", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/api/projects")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: [
                  {
                    id: "proj-001",
                    name: "Acme Workflow AI",
                    podScore: 78,
                    confidence: 84,
                    status: "testing",
                  },
                ],
              }),
          });
        }
        if (url.includes("/api/experiments")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: [
                  {
                    id: "exp-001",
                    name: "Smoke Test 1",
                    traffic: 1200,
                    conversions: 140,
                    highIntentActions: 80,
                  },
                ],
              }),
          });
        }
        if (url.includes("/api/insights")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: [
                  {
                    id: "ins-001",
                    title: "High Conversion on LinkedIn",
                    content: "Audience shows 8.4% conversion.",
                    confidence: 90,
                    type: "demand",
                  },
                ],
              }),
          });
        }
        if (url.includes("/api/ai/conversations")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: [] }),
          });
        }
        if (url.includes("/api/signals")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: [] }),
          });
        }
        if (url.includes("/api/funnel")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: [] }),
          });
        }
        if (url.includes("/api/audiences")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: [] }),
          });
        }
        if (url.includes("/api/sprint")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: { sprint: { daysRemaining: 4 } } }),
          });
        }
        if (url.includes("/api/landing-pages")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: [] }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [] }),
        });
      })
    );
  });

  it("Pillar 4 (AI Verdict): Renders the Hero Decision Verdict banner with GO verdict, PoD score, and WTP metrics", async () => {
    render(<AIAnalystPage />);
    await waitFor(() => {
      expect(screen.getByText(/AI Verdict & Analyst/i)).toBeTruthy();
      expect(screen.getByText(/GO — Statistically Validated Market Demand/i)).toBeTruthy();
      expect(screen.getByText(/Export Executive Brief/i)).toBeTruthy();
      expect(screen.getByText(/Optimal Conversion Elasticity/i)).toBeTruthy();
    });
  });

  it("Legacy Reports: Renders streamline banner linking to AI Verdict Engine", async () => {
    render(<ReportsPage />);
    await waitFor(() => {
      expect(
        screen.getByText(/Executive reporting is now unified into the AI Verdict & Analyst Engine/i)
      ).toBeTruthy();
      expect(screen.getByText(/Open AI Verdict Engine/i)).toBeTruthy();
    });
  });

  it("Legacy Signals: Renders streamline notice redirecting to Demand & Signals Hub", async () => {
    render(<SignalsPage />);
    await waitFor(() => {
      expect(
        screen.getByText(/Behavioral signals are now co-located directly inside the Demand & Signals Hub/i)
      ).toBeTruthy();
      expect(screen.getByText(/View in Demand Hub/i)).toBeTruthy();
    });
  });

  it("Legacy Audiences: Renders streamline notice redirecting to Demand Hub", async () => {
    render(<AudiencesPage />);
    await waitFor(() => {
      expect(
        screen.getByText(/Audience and channel attribution are now integrated directly into the Demand Hub/i)
      ).toBeTruthy();
      expect(screen.getByText(/View in Demand Hub/i)).toBeTruthy();
    });
  });

  it("Legacy Sprint: Renders streamline notice linking to Overview Command Center", async () => {
    render(<SprintPage />);
    await waitFor(() => {
      expect(
        screen.getByText(/Sprint Mode is now integrated directly into your Command Center Overview/i)
      ).toBeTruthy();
      expect(screen.getByText(/View in Command Center/i)).toBeTruthy();
    });
  });

  it("Legacy Landing Pages: Renders streamline notice linking to Experiments Hub", async () => {
    render(<LandingPagesPage />);
    await waitFor(() => {
      expect(
        screen.getByText(/Landing pages are now co-located directly inside the Experiments Hub/i)
      ).toBeTruthy();
      expect(screen.getByText(/View in Experiments Hub/i)).toBeTruthy();
    });
  });
});
