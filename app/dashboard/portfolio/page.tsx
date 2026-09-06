import { redirect } from "next/navigation";

/**
 * Legacy Portfolio Route
 *
 * Automatically forwards founders to the Tests / Experiments command center,
 * preserving clean URL compatibility while streamlining the solo founder workflow.
 */
export default function StudioPortfolioPage() {
  redirect("/dashboard/experiments");
}
