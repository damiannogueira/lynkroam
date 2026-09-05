import { expect, test } from "@playwright/test";

test("navigates from the Lynkroam landing page to the Trips dashboard", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Turn scattered travel research into confident trip decisions.",
    }),
  ).toBeVisible();

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

  await page.getByRole("link", { name: "View trips" }).click();

  await expect(page).toHaveURL(/\/trips$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Trips" }),
  ).toBeVisible();
});
