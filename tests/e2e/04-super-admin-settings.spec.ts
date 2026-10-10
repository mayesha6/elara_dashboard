import { test, expect } from "@playwright/test";

test.describe("Super Admin Settings & Configuration Workflow", () => {
  test("should protect settings management page with auth guard", async ({ page }) => {
    await page.goto("/super-admin/settings");
    await expect(page).toHaveURL(/login/);
    const body = page.locator("body").first();
    await expect(body).toBeVisible();
  });

  test("should protect category and point allocation settings", async ({ page }) => {
    await page.goto("/super-admin/settings/category-management");
    await expect(page).toHaveURL(/login/);
  });
});
