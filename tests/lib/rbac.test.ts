import { describe, it, expect } from "vitest";
import { hasRole } from "@/lib/rbac";

describe("rbac — hasRole", () => {
  it("owner satisfies all levels", () => {
    expect(hasRole("owner", "member")).toBe(true);
    expect(hasRole("owner", "admin")).toBe(true);
    expect(hasRole("owner", "owner")).toBe(true);
  });
  it("admin satisfies member and admin but not owner", () => {
    expect(hasRole("admin", "member")).toBe(true);
    expect(hasRole("admin", "admin")).toBe(true);
    expect(hasRole("admin", "owner")).toBe(false);
  });
  it("member only satisfies member", () => {
    expect(hasRole("member", "member")).toBe(true);
    expect(hasRole("member", "admin")).toBe(false);
    expect(hasRole("member", "owner")).toBe(false);
  });
  it("null role never satisfies", () => {
    expect(hasRole(null, "member")).toBe(false);
  });
});
