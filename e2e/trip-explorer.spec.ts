import { expect, test } from "@playwright/test";

test("explores destinations through the 3D Trip Explorer", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Explore" })
    .click();

  await expect(page).toHaveURL(/\/explore$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "3D Trip Explorer" }),
  ).toBeVisible();

  const destinationControls = page.getByRole("group", {
    name: "Trip Explorer destinations",
  });
  const barcelonaButton = destinationControls.getByRole("button", {
    name: /Barcelona/,
  });
  const lisbonButton = destinationControls.getByRole("button", {
    name: /Lisbon/,
  });
  const tokyoButton = destinationControls.getByRole("button", {
    name: /Tokyo/,
  });

  await expect(barcelonaButton).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByText(
      "Compare neighborhood bases, group architecture stops by area, and keep flexible meal options nearby.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("figure", { name: "Barcelona" }),
  ).toBeVisible();

  const launchButton = page.getByRole("button", {
    name: "View Barcelona in 3D",
  });
  await expect(launchButton).toBeVisible();
  await expect(
    page.getByText(
      "The 3D forms are conceptual, destination-inspired compositions rather than literal maps or landmark models.",
    ),
  ).toBeVisible();

  await lisbonButton.click();
  await expect(lisbonButton).toHaveAttribute("aria-pressed", "true");
  await expect(barcelonaButton).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByText(
      "Compare transit access with walking effort, then shortlist viewpoints and food areas that fit the same route.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("figure", { name: "Lisbon" })).toBeVisible();
  const lisbonLaunchButton = page.getByRole("button", {
    name: "View Lisbon in 3D",
  });
  await expect(lisbonLaunchButton).toBeVisible();

  await lisbonLaunchButton.click();

  const interactiveLisbon = page.getByRole("img", {
    name: "Interactive 3D destination scene for Lisbon",
  });
  const unavailableLabel = page.getByText("Static preview — 3D unavailable");

  await expect(interactiveLisbon.or(unavailableLabel)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^View .+ in 3D$/ }),
  ).toHaveCount(0);

  const interactiveSceneAvailable = await interactiveLisbon.isVisible();

  if (!interactiveSceneAvailable) {
    await expect(
      page.getByRole("figure", { name: "Lisbon" }),
    ).toBeVisible();
    await expect(unavailableLabel).toBeVisible();
  }

  await tokyoButton.click();
  await expect(tokyoButton).toHaveAttribute("aria-pressed", "true");
  await expect(lisbonButton).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByText(
      "Group decisions by rail corridor, compare district priorities, and leave space for discoveries between planned anchors.",
    ),
  ).toBeVisible();

  if (interactiveSceneAvailable) {
    await expect(
      page.getByRole("img", {
        name: "Interactive 3D destination scene for Tokyo",
      }),
    ).toBeVisible();
  } else {
    await expect(page.getByRole("figure", { name: "Tokyo" })).toBeVisible();
    await expect(unavailableLabel).toBeVisible();
  }
});
