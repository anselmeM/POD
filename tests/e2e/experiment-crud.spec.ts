import { test, expect } from "@playwright/test";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("alex@example.com");
  await page.getByLabel("Password").fill("demo12345");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
}

test("experiment CRUD: create, view, and delete", async ({ page }) => {
  await signIn(page);

  // Create
  await page.goto("/dashboard/experiments/new");
  const expName = `E2E Exp ${Date.now()}`;
  await page.getByLabel("Experiment Name").fill(expName);
  // Fill first variant headline to satisfy validation
  const headlineInputs = page.getByLabel("Headline");
  if (await headlineInputs.first().isVisible()) {
    await headlineInputs.first().fill("E2E Headline A");
    if (await headlineInputs.nth(1).isVisible()) await headlineInputs.nth(1).fill("E2E Headline B");
  }
  await page.getByRole("button", { name: "Create Experiment" }).click();
  await expect(page).toHaveURL(/\/dashboard\/experiments\/.+/, { timeout: 15_000 });
  await expect(page.getByText(expName)).toBeVisible({ timeout: 10_000 });
  const expId = page.url().split("/").pop()!.split("?")[0];

  // View in list
  await page.goto("/dashboard/experiments");
  await expect(page.getByText(expName).first()).toBeVisible({ timeout: 10_000 });

  // Delete via API (to keep DB clean) — use authenticated fetch in browser context
  await page.request.delete(`/api/experiments/${expId}`);
  await page.goto("/dashboard/experiments");
  await expect(page.getByText(expName)).not.toBeVisible({ timeout: 5_000 });
});
