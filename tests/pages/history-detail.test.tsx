import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import HistoryDetailPage from "@/app/dashboard/history/[id]/page";
import { demoHistoryItems } from "@/lib/mock-data";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "hist-001" }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

const fetchHistory = () =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: demoHistoryItems }),
  });

describe("HistoryDetailPage", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(fetchHistory));
  });

  it("renders the detail page with valid ID", async () => {
    render(<HistoryDetailPage />);
    const item = demoHistoryItems[0];
    await waitFor(() => expect(screen.getByText(item.project)).toBeTruthy());
    expect(screen.getByText(item.verdict)).toBeTruthy();
  });

  it("displays the score", async () => {
    render(<HistoryDetailPage />);
    await waitFor(() => expect(screen.getByText(/78/)).toBeTruthy());
  });

  it("displays key insight", async () => {
    render(<HistoryDetailPage />);
    const item = demoHistoryItems[0];
    await waitFor(() => expect(screen.getByText(item.keyInsight)).toBeTruthy());
  });

  it("shows not-found state for unknown ID", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [] }) })
      )
    );
    render(<HistoryDetailPage />);
    await waitFor(() =>
      expect(screen.getByText("History entry not found.")).toBeTruthy()
    );
  });
});
