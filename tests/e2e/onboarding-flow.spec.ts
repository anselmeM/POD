import { test, expect } from "@playwright/test";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/sign-in");
  await page.locator('input[type="email"]').fill("alex@example.com");
  await page.locator('input[type="password"]').fill("demo12345");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

test("onboarding wizard creates project and redirects", async ({ page }) => {
  await signIn(page);
  await page.goto("/onboarding");

  // Step 1: Product
  await page.getByLabel("Product Name").fill(`E2E Product ${Date.now()}`);
  await page.getByLabel("One-Line Description").fill("E2E tagline for validation");
  await page.getByRole("button", { name: "Next", exact: true }).click();

  // Step 2: Problem
  await page.getByLabel("Core Problem").fill("Manual reporting wastes time");
  await page.getByLabel("Existing Alternatives").fill("Spreadsheets, Notion");
  await page.getByRole("button", { name: "Next", exact: true }).click();

  // Step 3: Pricing/Business
  await page.getByLabel("Expected Price Range").fill("$49-99");
  await page.getByLabel("Business Model").fill("SaaS subscription");
  await page.getByRole("button", { name: "Next", exact: true }).click();

  // Step 4: Full description
  await page.getByLabel("Full Description").fill("E2E full description of the product idea for testing.");
  await page.getByRole("button", { name: "Next", exact: true }).click();

  // Step 5: Audience (may require filling audience fields)
  const jobTitle = page.getByLabel("Job Title");
  if (await jobTitle.isVisible()) {
    await jobTitle.fill("Operations Manager");
    const industry = page.getByLabel("Industry");
    if (await industry.isVisible()) await industry.fill("SaaS");
    const companySize = page.getByLabel("Company Size");
    if (await companySize.isVisible()) await companySize.fill("20-200");
  }
  await page.getByRole("button", { name: "Next", exact: true }).click();

  // Step 6: Review / Create
  const createBtn = page.getByRole("button", { name: "Launch" }).last();
  await createBtn.click();
  await expect(page).toHaveURL(/\/dashboard\/experiments\//, { timeout: 15_000 });
});
