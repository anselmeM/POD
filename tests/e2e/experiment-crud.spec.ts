import { test, expect } from "@playwright/test";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/sign-in");
  await page.locator('input[type="email"]').fill("alex@example.com");
  await page.locator('input[type="password"]').fill("demo12345");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

test("experiment CRUD: create, view, and delete", async ({ page }) => {
  await signIn(page);

  // Create
  await page.goto("/dashboard/experiments/new");
  const expName = `E2E Exp ${Date.now()}`;
  await page.getByLabel("Experiment Name").fill(expName);
  // Fill all variant headlines to satisfy validation
  const headlineInputs = page.getByPlaceholder("e.g., Stop Losing Hours to Manual Reporting");
  const count = await headlineInputs.count();
  for (let i = 0; i < count; i++) {
    await headlineInputs.nth(i).fill(`E2E Headline ${i + 1}`);
  }
  await page.getByRole("button", { name: "Create Experiment" }).click();
  await expect(page).toHaveURL(/\/dashboard\/experiments\/(?!new$)[^/]+/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: expName })).toBeVisible({ timeout: 15_000 });
  const expId = page.url().split("/").pop()!.split("?")[0];

  // View in list
  await page.goto("/dashboard/experiments");
  await expect(page.getByText(expName).first()).toBeVisible({ timeout: 10_000 });

  // Delete via API (to keep DB clean) — use authenticated fetch in browser context
  await page.request.delete(`/api/experiments/${expId}`);
  await page.goto("/dashboard/experiments");
  await expect(page.getByText(expName)).not.toBeVisible({ timeout: 5_000 });
});
