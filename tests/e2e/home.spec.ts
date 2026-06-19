import { expect, test } from "@playwright/test";

test("homepage shows zooming background", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator(".shop-room-bg__zoom")).toBeAttached({ timeout: 15_000 });

  const animationName = await page
    .locator(".shop-room-bg__zoom")
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(animationName).toContain("boutiqueBgZoom");
});

test("homepage shows table with products", async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".shop-room-bg__zoom")).toBeAttached({ timeout: 15_000 });
  await expect(page.locator("canvas")).toBeVisible({ timeout: 60_000 });
});
