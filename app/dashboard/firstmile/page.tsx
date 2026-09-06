import { redirect } from "next/navigation";

/**
 * Legacy FirstMile Route
 *
 * Automatically forwards founders to the solo founder Overview command center,
 * preserving backwards compatibility.
 */
export default function FirstMileDevsPage() {
  redirect("/dashboard");
}
