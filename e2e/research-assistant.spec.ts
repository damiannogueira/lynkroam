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

  await page.goto("/");
  await page
    .getByRole("link", { name: "Open Barcelona research trip" })
    .click();
  await page
    .getByRole("navigation", { name: "Trip workspace navigation" })
    .getByRole("link", { name: "Research Assistant" })
    .click();

  const messageInput = page.getByLabel("Message");
  await expect(messageInput).toBeVisible();
  await messageInput.fill(
    "What should I prioritize for this Barcelona trip?",
  );
  await page.getByRole("button", { name: "Send" }).click();

  await expect(page.getByText(assistantResponse)).toBeVisible();
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  await expect(messageInput).toBeEnabled();
  expect(chatRequestCount).toBe(1);
});
