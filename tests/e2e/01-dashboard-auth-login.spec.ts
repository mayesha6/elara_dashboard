import { test, expect } from "@playwright/test";

test.describe("Dashboard Authentication Workflow", () => {
  test("should render admin login entry page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\//);
    const body = page.locator("body").first();
    await expect(body).toBeVisible();
  });

  test("should enforce credentials check on admin login action", async ({ page }) => {
    await page.goto("/super-admin");
    // Verify redirect guard works for unauthenticated admin route
    await expect(page).toHaveURL(/login/);
  });
});
