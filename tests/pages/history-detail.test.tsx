import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HistoryDetailPage from "@/app/dashboard/history/[id]/page";
import { demoHistoryItems } from "@/lib/mock-data";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "hist-001" }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

describe("HistoryDetailPage", () => {
  it("renders the detail page with valid ID", () => {
    render(<HistoryDetailPage />);
    const item = demoHistoryItems[0];
    expect(screen.getByText(item.project)).toBeTruthy();
    expect(screen.getByText(item.verdict)).toBeTruthy();
  });

  it("displays the score", () => {
    render(<HistoryDetailPage />);
    expect(screen.getByText(/78/)).toBeTruthy();
  });

  it("displays key insight", () => {
    render(<HistoryDetailPage />);
    const item = demoHistoryItems[0];
    expect(screen.getByText(item.keyInsight)).toBeTruthy();
  });

  it("displays description", () => {
    render(<HistoryDetailPage />);
    const item = demoHistoryItems[0];
    expect(screen.getByText(item.description)).toBeTruthy();
  });
});
