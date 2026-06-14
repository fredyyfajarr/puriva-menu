import { expect, test } from "@playwright/test";

test("landing page promotes store and links to menu", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByLabel("Puriva").first()).toBeVisible();
  await expect(page.locator("h1").filter({ hasText: "Live" }).first()).toBeVisible();
  await expect(page.locator("h1").filter({ hasText: "Cold Pressed & Blended Juice" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Lihat menu/i }).first()).toBeVisible();

  await page.getByRole("link", { name: /Lihat menu/i }).first().click();
  await expect(page).toHaveURL(/\/menu$/);
  await expect(page.getByText(/Cold-Pressed Juice/i).first()).toBeVisible();
});
