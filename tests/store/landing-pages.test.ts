import { describe, it, expect, beforeEach, vi } from "vitest";
import { useLandingPageStore } from "@/lib/store";
import { demoLandingPages } from "@/lib/mock-data";

// Mock fetch globally — tests exercise the store's client-side state logic
beforeEach(() => {
  useLandingPageStore.setState({ landingPages: [...demoLandingPages], loading: false, error: null });

  vi.stubGlobal("fetch", vi.fn(async (url: string, opts?: RequestInit) => {
    const method = opts?.method || "GET";
    if (method === "POST") {
      const body = JSON.parse(opts?.body as string || "{}");
      return { ok: true, json: async () => ({ data: { ...body, id: "lp-new", createdAt: "2026-01-20", updatedAt: "2026-01-20" } }) };
    }
    if (method === "PATCH") {
      const body = JSON.parse(opts?.body as string || "{}");
      return { ok: true, json: async () => ({ data: { id: url.split("/").pop(), ...body, updatedAt: "2026-01-20" } }) };
    }
    if (method === "DELETE") {
      return { ok: true, json: async () => ({ data: {}, message: "Deleted" }) };
    }
    return { ok: true, json: async () => ({ data: demoLandingPages, total: demoLandingPages.length }) };
  }));
});

describe("useLandingPageStore", () => {
  it("initializes with demo landing pages", () => {
    const { landingPages } = useLandingPageStore.getState();
    expect(landingPages).toHaveLength(6);
    expect(landingPages[0].slug).toBe("variant-a-time-savings");
  });

  it("adds a new landing page", async () => {
    const { addLandingPage } = useLandingPageStore.getState();
    await addLandingPage({ projectId: "proj-001", name: "Test Page", template: "hero", headline: "Test Headline", subheadline: "Test Sub", cta: "Get Started", positioning: "Test", status: "live", slug: "test-page", visitors: 0, conversions: 0, conversionRate: 0, bounceRate: 0, avgTimeOnPage: 0 });
    const { landingPages } = useLandingPageStore.getState();
    expect(landingPages).toHaveLength(7);
    expect(landingPages.find((lp) => lp.id === "lp-new")?.name).toBe("Test Page");
  });

  it("updates an existing landing page", async () => {
    const { updateLandingPage } = useLandingPageStore.getState();
    await updateLandingPage("lp-001", { headline: "Updated Headline" });
    const { landingPages } = useLandingPageStore.getState();
    expect(landingPages.find((lp) => lp.id === "lp-001")?.headline).toBe("Updated Headline");
  });

  it("does not mutate other pages when updating one", async () => {
    const { updateLandingPage } = useLandingPageStore.getState();
    await updateLandingPage("lp-001", { headline: "Changed" });
    const { landingPages } = useLandingPageStore.getState();
    expect(landingPages.find((lp) => lp.id === "lp-002")?.headline).toBe("Reduce Weekly Reporting Time by 50%");
  });

  it("updates status of a landing page", async () => {
    const { updateLandingPageStatus } = useLandingPageStore.getState();
    await updateLandingPageStatus("lp-001", "paused");
    expect(useLandingPageStore.getState().landingPages.find((lp) => lp.id === "lp-001")?.status).toBe("paused");
  });

  it("can toggle status back to live", async () => {
    const { updateLandingPageStatus } = useLandingPageStore.getState();
    await updateLandingPageStatus("lp-003", "live");
    expect(useLandingPageStore.getState().landingPages.find((lp) => lp.id === "lp-003")?.status).toBe("live");
  });

  it("deletes a landing page", async () => {
    const { deleteLandingPage } = useLandingPageStore.getState();
    await deleteLandingPage("lp-001");
    const { landingPages } = useLandingPageStore.getState();
    expect(landingPages).toHaveLength(5);
    expect(landingPages.find((lp) => lp.id === "lp-001")).toBeUndefined();
  });

  it("does not affect other pages when deleting", async () => {
    const { deleteLandingPage } = useLandingPageStore.getState();
    await deleteLandingPage("lp-001");
    const { landingPages } = useLandingPageStore.getState();
    expect(landingPages.find((lp) => lp.id === "lp-002")).toBeDefined();
    expect(landingPages.find((lp) => lp.id === "lp-003")).toBeDefined();
  });

  it("updateLandingPage on non-existent id is a no-op", async () => {
    const { updateLandingPage } = useLandingPageStore.getState();
    await updateLandingPage("nonexistent", { headline: "nope" });
    expect(useLandingPageStore.getState().landingPages).toHaveLength(6);
  });

  it("deleteLandingPage on non-existent id is a no-op", async () => {
    const { deleteLandingPage } = useLandingPageStore.getState();
    await deleteLandingPage("nonexistent");
    expect(useLandingPageStore.getState().landingPages).toHaveLength(6);
  });
});
