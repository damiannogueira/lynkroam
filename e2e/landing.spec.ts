import { expect, test } from "@playwright/test";

test("navigates from the Lynkroam landing page to the Trips dashboard", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Turn scattered travel research into confident trip decisions.",
    }),
  ).toBeVisible();

  const hero = page.locator("main section");
  const shaderCanvas = hero.locator("canvas");
  await expect(shaderCanvas).toHaveCount(1);
  await expect(shaderCanvas).toHaveAttribute("aria-hidden", "true");
  await expect(shaderCanvas).toHaveAttribute("tabindex", "-1");

  const viewTripsLink = page.getByRole("link", { name: "View trips" });
  const exploreLink = hero.getByRole("link", { name: "Explore", exact: true });
  await expect(viewTripsLink).toBeVisible();
  await expect(viewTripsLink).toHaveAttribute("href", "/trips");
  await expect(exploreLink).toBeVisible();
  await expect(exploreLink).toHaveAttribute("href", "/explore");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);

  const primaryNavigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });
  await expect(
    primaryNavigation.getByRole("link", { name: "Trips" }),
  ).toHaveAttribute("href", "/trips");
  await expect(page.getByRole("link", { name: "Lynkroam" })).toHaveAttribute(
    "href",
    "/",
  );

  await viewTripsLink.click();

  await expect(page).toHaveURL(/\/trips$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Trips" }),
  ).toBeVisible();
});
