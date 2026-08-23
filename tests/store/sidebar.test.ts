import { describe, it, expect, beforeEach } from "vitest";
import { useSidebarStore } from "@/lib/store";

describe("useSidebarStore", () => {
  beforeEach(() => {
    // reset to defaults
    useSidebarStore.setState({ collapsed: false, mobileOpen: false });
  });

  it("starts with collapsed=false and mobileOpen=false", () => {
    const s = useSidebarStore.getState();
    expect(s.collapsed).toBe(false);
    expect(s.mobileOpen).toBe(false);
  });

  it("toggle flips collapsed", () => {
    useSidebarStore.getState().toggle();
    expect(useSidebarStore.getState().collapsed).toBe(true);
    useSidebarStore.getState().toggle();
    expect(useSidebarStore.getState().collapsed).toBe(false);
  });

  it("setMobileOpen sets mobileOpen", () => {
    useSidebarStore.getState().setMobileOpen(true);
    expect(useSidebarStore.getState().mobileOpen).toBe(true);
    useSidebarStore.getState().setMobileOpen(false);
    expect(useSidebarStore.getState().mobileOpen).toBe(false);
  });
});
