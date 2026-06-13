import { expect, test } from "@playwright/test";

import { getActiveTableQrToken } from "./helpers";

test("customer can submit a cash order from a valid table QR token", async ({ page }) => {
  const token = await getActiveTableQrToken();

  await page.goto(`/table/${token}`);

  await expect(page.getByRole("heading", { name: /Puriva Live Order/i })).toBeVisible();
  await expect(page.getByText(/QR order/i)).toBeVisible();

  await page.getByRole("button", { name: /Original/i }).first().click();
  await expect(page.getByRole("heading", { name: /Cart/i })).toBeVisible();

  await page.getByLabel(/Nama opsional/i).fill(`E2E ${Date.now()}`);
  await page.getByLabel(/Catatan order/i).fill("Automated E2E order");
  await page.getByLabel(/Cash/i).check();
  const submitButton = page.getByRole("button", { name: /Submit order/i });
  await expect(submitButton).toBeEnabled();
  await submitButton.click();

  await expect(page).toHaveURL(new RegExp(`/table/${token}/success`));
  await expect(page.getByText(/Pesanan kamu sudah masuk ke kasir/i)).toBeVisible();
  await expect(page.getByText(/Payment: Cash di kasir/i)).toBeVisible();
});
