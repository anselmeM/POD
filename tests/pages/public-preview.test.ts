import { describe, it, expect } from "vitest";
import { demoLandingPages } from "@/lib/mock-data";
import type { LandingPage } from "@/lib/types";

// ---------------------------------------------------------------------------
// Slug resolution logic (mirrors /p/[slug] page.tsx)
// ---------------------------------------------------------------------------

function resolvePage(
  slug: string | undefined,
  storePages: LandingPage[],
): LandingPage | undefined {
  const allPages: LandingPage[] =
    storePages.length > 0
      ? [
          ...storePages,
          ...demoLandingPages.filter((d) => !storePages.some((lp) => lp.id === d.id)),
        ]
      : [...demoLandingPages];

  if (!slug) return undefined;
  return allPages.find((lp) => lp.slug === slug || lp.id === slug);
}

describe("public preview slug resolution", () => {
  it("resolves by slug", () => {
    const page = resolvePage("variant-a-time-savings", demoLandingPages);
    expect(page).toBeDefined();
    expect(page?.id).toBe("lp-001");
  });

  it("resolves by id as fallback", () => {
    const page = resolvePage("lp-001", demoLandingPages);
    expect(page).toBeDefined();
    expect(page?.slug).toBe("variant-a-time-savings");
  });

  it("returns undefined for unknown slug", () => {
    const page = resolvePage("nonexistent-page", demoLandingPages);
    expect(page).toBeUndefined();
  });

  it("returns undefined for empty slug", () => {
    const page = resolvePage(undefined, demoLandingPages);
    expect(page).toBeUndefined();
  });

  it("returns undefined for empty string slug", () => {
    const page = resolvePage("", demoLandingPages);
    expect(page).toBeUndefined();
  });

  it("falls back to mock data when store is empty", () => {
    const page = resolvePage("variant-b-automation", []);
    expect(page).toBeDefined();
    expect(page?.id).toBe("lp-002");
  });

  it("store pages take priority over mock data", () => {
    const customPage: LandingPage = {
      ...demoLandingPages[0],
      id: "lp-custom",
      slug: "variant-a-time-savings", // same slug as mock
      name: "Custom Override",
    };

    const page = resolvePage("variant-a-time-savings", [customPage]);
    expect(page?.name).toBe("Custom Override");
  });

  it("resolves all 6 mock pages by slug", () => {
    for (const lp of demoLandingPages) {
      const resolved = resolvePage(lp.slug, demoLandingPages);
      expect(resolved?.id).toBe(lp.id);
    }
  });
});
