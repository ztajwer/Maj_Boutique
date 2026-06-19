import { expect, test } from "@playwright/test";

test("loader, door invite, and background zoom", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator(".loader-screen")).toBeVisible({ timeout: 5_000 });
  await expect(page.locator(".loader-stars-field")).toBeAttached();

  await expect(page.locator(".loader-screen")).toBeHidden({ timeout: 6_000 });

  await expect(page.locator(".door-invite")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Scroll to Open the Doors")).toBeVisible();

  await page.locator(".door-invite__close").click();
  await expect(page.locator(".door-invite")).toBeHidden();

  await expect(page.locator(".door-screen")).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("canvas")).toBeVisible({ timeout: 10_000 });
});

test("doors open to shop table", async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".loader-screen")).toBeHidden({ timeout: 6_000 });
  await expect(page.locator(".door-invite")).toBeVisible({ timeout: 10_000 });
  await page.locator(".door-invite__close").click();

  await page.mouse.wheel(0, 600);

  await expect(page.locator("canvas")).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(5500);
  await expect(page.locator(".shop-room-bg__zoom")).toBeAttached();
});
