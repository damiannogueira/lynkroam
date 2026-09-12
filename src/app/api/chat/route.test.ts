import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResearchAssistantUIMessage } from "@/lib/ai/types";

const aiMocks = vi.hoisted(() => ({
  safeValidateUIMessages: vi.fn(),
  convertToModelMessages: vi.fn(),
  streamText: vi.fn(),
}));

vi.mock("ai", () => ({
  consumeStream: vi.fn(),
  convertToModelMessages: aiMocks.convertToModelMessages,
  safeValidateUIMessages: aiMocks.safeValidateUIMessages,
  stepCountIs: vi.fn(() => "two-steps"),
  streamText: aiMocks.streamText,
}));

vi.mock("@/lib/ai/config", () => ({
  RESEARCH_ASSISTANT_MAX_OUTPUT_TOKENS: 1600,
  RESEARCH_ASSISTANT_PROVIDER_OPTIONS: {},
  RESEARCH_ASSISTANT_SYSTEM_PROMPT: "Test system prompt",
  researchAssistantModel: "test-model",
}));

vi.mock("@/lib/ai/tools", () => ({
  researchAssistantTools: {},
}));

import { maxDuration, POST } from "@/app/api/chat/route";

function userMessage(text: string, index = 0): ResearchAssistantUIMessage {
  return {
    id: `user-${index}`,
    role: "user",
    parts: [{ type: "text", text }],
  };
}

function chatRequest(
  messages: ResearchAssistantUIMessage[],
  headers?: HeadersInit,
) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify({ messages }),
  });
}

beforeEach(() => {
  aiMocks.safeValidateUIMessages.mockImplementation(
    async ({ messages }: { messages: ResearchAssistantUIMessage[] }) => ({
      success: true,
      data: messages,
    }),
  );
  aiMocks.convertToModelMessages.mockResolvedValue([]);
  aiMocks.streamText.mockReturnValue({
    toUIMessageStreamResponse: () => new Response("stream"),
  });
});

describe("POST /api/chat production limits", () => {
  it("allows a small valid request to reach the AI stream", async () => {
    const response = await POST(chatRequest([userMessage("Compare options.")]));

    expect(response.status).toBe(200);
    expect(aiMocks.convertToModelMessages).toHaveBeenCalledTimes(1);
    expect(aiMocks.streamText).toHaveBeenCalledTimes(1);
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        body: "{not-json",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid chat request.",
    });
    expect(aiMocks.streamText).not.toHaveBeenCalled();
  });

  it("returns 400 for a missing body or invalid messages shape", async () => {
    const missingBodyResponse = await POST(
      new Request("http://localhost/api/chat", { method: "POST" }),
    );
    const invalidShapeResponse = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: "not-an-array" }),
      }),
    );

    expect(missingBodyResponse.status).toBe(400);
    expect(invalidShapeResponse.status).toBe(400);
    expect(aiMocks.safeValidateUIMessages).not.toHaveBeenCalled();
    expect(aiMocks.streamText).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed UTF-8", async () => {
    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        body: new Uint8Array([0xc3, 0x28]),
      }),
    );

    expect(response.status).toBe(400);
    expect(aiMocks.streamText).not.toHaveBeenCalled();
  });

  it("enforces the body cap using encoded bytes", async () => {
    const body = JSON.stringify({ messages: [userMessage("é".repeat(33_000))] });

    expect(body.length).toBeLessThan(65_536);
    expect(new TextEncoder().encode(body).byteLength).toBeGreaterThan(65_536);

    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "content-length": "1" },
        body,
      }),
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      error: "Chat request is too large.",
    });
    expect(aiMocks.safeValidateUIMessages).not.toHaveBeenCalled();
    expect(aiMocks.convertToModelMessages).not.toHaveBeenCalled();
    expect(aiMocks.streamText).not.toHaveBeenCalled();
  });

  it("rejects more than 50 validated messages before conversion", async () => {
    const messages = Array.from({ length: 51 }, (_, index) =>
      userMessage("x", index),
    );

    const response = await POST(chatRequest(messages));

    expect(response.status).toBe(413);
    expect(aiMocks.convertToModelMessages).not.toHaveBeenCalled();
    expect(aiMocks.streamText).not.toHaveBeenCalled();
  });

  it("rejects a text part longer than 4,000 characters", async () => {
    const response = await POST(chatRequest([userMessage("x".repeat(4_001))]));

    expect(response.status).toBe(413);
    expect(aiMocks.convertToModelMessages).not.toHaveBeenCalled();
    expect(aiMocks.streamText).not.toHaveBeenCalled();
  });

  it("rejects more than 24,000 cumulative text characters", async () => {
    const messages = [
      ...Array.from({ length: 6 }, (_, index) =>
        userMessage("x".repeat(4_000), index),
      ),
      userMessage("x", 6),
    ];

    const response = await POST(chatRequest(messages));

    expect(response.status).toBe(413);
    expect(aiMocks.convertToModelMessages).not.toHaveBeenCalled();
    expect(aiMocks.streamText).not.toHaveBeenCalled();
  });

  it("accepts the exact message, part, and conversation boundaries", async () => {
    const messages = [
      ...Array.from({ length: 5 }, (_, index) =>
        userMessage("x".repeat(4_000), index),
      ),
      userMessage("x".repeat(3_956), 5),
      ...Array.from({ length: 44 }, (_, index) => userMessage("x", index + 6)),
    ];

    expect(messages).toHaveLength(50);
    expect(
      messages.reduce(
        (total, message) => total + message.parts[0].text.length,
        0,
      ),
    ).toBe(24_000);

    const response = await POST(chatRequest(messages));

    expect(response.status).toBe(200);
    expect(aiMocks.convertToModelMessages).toHaveBeenCalledTimes(1);
    expect(aiMocks.streamText).toHaveBeenCalledTimes(1);
  });

  it("exports a 60-second maximum duration", () => {
    expect(maxDuration).toBe(60);
  });
});
