import { test, expect } from "@playwright/test";

test.describe("Department Admin Dashboard Workflow", () => {
  test("should protect department admin dashboard route", async ({ page }) => {
    await page.goto("/user/dashboard");
    await expect(page).toHaveURL(/login/);
    const body = page.locator("body").first();
    await expect(body).toBeVisible();
  });

  test("should protect user rewards and claim management routes", async ({ page }) => {
    await page.goto("/user/claim-rewards");
    await expect(page).toHaveURL(/login/);
  });
});
