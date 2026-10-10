import { test, expect } from "@playwright/test";

test.describe("Super Admin Organization Management Workflow", () => {
  test("should protect super admin organization route and redirect unauthenticated access", async ({ page }) => {
    await page.goto("/super-admin/organizations");
    await expect(page).toHaveURL(/login/);
    const body = page.locator("body").first();
    await expect(body).toBeVisible();
  });

  test("should protect department management route", async ({ page }) => {
    await page.goto("/super-admin/department-management");
    await expect(page).toHaveURL(/login/);
  });
});
