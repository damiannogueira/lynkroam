import { expect, test } from "@playwright/test";

test("completes the Research Assistant primary flow with a mocked AI response", async ({
  page,
}) => {
  let chatRequestCount = 0;
  const assistantResponse =
    "A deterministic research response for Barcelona.";
  const streamEvents = [
    { type: "start", messageId: "assistant-e2e" },
    { type: "start-step" },
    { type: "text-start", id: "text-e2e" },
    { type: "text-delta", id: "text-e2e", delta: assistantResponse },
    { type: "text-end", id: "text-e2e" },
    { type: "finish-step" },
    { type: "finish", finishReason: "stop" },
  ];
  const streamBody = `${streamEvents
    .map((event) => `data: ${JSON.stringify(event)}\n\n`)
    .join("")}data: [DONE]\n\n`;

  await page.route("**/api/chat", async (route) => {
    expect(route.request().method()).toBe("POST");
    chatRequestCount += 1;

    await route.fulfill({
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "x-vercel-ai-ui-message-stream": "v1",
      },
      body: streamBody,
    });
  });

  await page.goto("/trips");
  await page
    .getByRole("link", { name: "Open Barcelona research trip" })
    .click();
  await page
    .getByRole("navigation", { name: "Trip workspace navigation" })
    .getByRole("link", { name: "Research Assistant" })
    .click();

  const messageInput = page.getByLabel("Message");
  await expect(messageInput).toBeVisible();
  const initialMessageInput = await messageInput.elementHandle();
  expect(initialMessageInput).not.toBeNull();
  if (!initialMessageInput) {
    throw new Error("Research Assistant textarea was not mounted.");
  }
  await messageInput.fill(
    "What should I prioritize for this Barcelona trip?",
  );
  await page.getByRole("button", { name: "Send" }).click();

  const assistantMessage = page
    .getByRole("article")
    .filter({ hasText: assistantResponse });
  await expect(assistantMessage.getByText(assistantResponse)).toBeVisible();
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  await expect(messageInput).toBeEnabled();
  const finalMessageInput = await messageInput.elementHandle();
  expect(finalMessageInput).not.toBeNull();
  if (!finalMessageInput) {
    throw new Error("Research Assistant textarea was replaced.");
  }
  expect(
    await initialMessageInput.evaluate(
      (initialElement, finalElement) => initialElement === finalElement,
      finalMessageInput,
    ),
  ).toBe(true);
  expect(chatRequestCount).toBe(1);
});
