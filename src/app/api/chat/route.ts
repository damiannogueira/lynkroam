import {
  consumeStream,
  convertToModelMessages,
  safeValidateUIMessages,
  stepCountIs,
  streamText,
} from "ai";
import {
  RESEARCH_ASSISTANT_MAX_OUTPUT_TOKENS,
  RESEARCH_ASSISTANT_PROVIDER_OPTIONS,
  RESEARCH_ASSISTANT_SYSTEM_PROMPT,
  researchAssistantModel,
} from "@/lib/ai/config";
import { researchAssistantTools } from "@/lib/ai/tools";
import type { ResearchAssistantUIMessage } from "@/lib/ai/types";

const INVALID_REQUEST_MESSAGE = "Invalid chat request.";
const OVERSIZED_REQUEST_MESSAGE = "Chat request is too large.";
const STREAM_ERROR_MESSAGE =
  "The Research Assistant could not complete this response.";
const MAX_REQUEST_BODY_BYTES = 65_536;
const MAX_CHAT_MESSAGES = 50;
const MAX_TEXT_PART_CHARACTERS = 4_000;
const MAX_CONVERSATION_TEXT_CHARACTERS = 24_000;

export const maxDuration = 60;

type ChatRequestBody = {
  messages: unknown[];
};

type BoundedJsonResult =
  | { status: "valid"; value: unknown }
  | { status: "invalid" }
  | { status: "too-large" };

async function readBoundedJson(request: Request): Promise<BoundedJsonResult> {
  const declaredLength = Number(request.headers.get("content-length"));

  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_REQUEST_BODY_BYTES
  ) {
    return { status: "too-large" };
  }

  if (!request.body) {
    return { status: "invalid" };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteCount = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      byteCount += value.byteLength;

      if (byteCount > MAX_REQUEST_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        return { status: "too-large" };
      }

      chunks.push(value);
    }

    const bytes = new Uint8Array(byteCount);
    let offset = 0;

    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);

    return { status: "valid", value: JSON.parse(text) as unknown };
  } catch {
    return { status: "invalid" };
  }
}

function isChatRequestBody(value: unknown): value is ChatRequestBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "messages" in value &&
    Array.isArray(value.messages)
  );
}

function normalizeConversation(
  messages: ResearchAssistantUIMessage[],
): ResearchAssistantUIMessage[] | null {
  if (messages.length === 0) {
    return null;
  }

  const normalizedMessages: ResearchAssistantUIMessage[] = [];

  for (const message of messages) {
    if (message.role === "user") {
      const containsOnlyText = message.parts.every(
        (part) => part.type === "text",
      );
      const containsVisibleText = message.parts.some(
        (part) => part.type === "text" && part.text.trim().length > 0,
      );

      if (!containsOnlyText || !containsVisibleText) {
        return null;
      }

      normalizedMessages.push(message);
      continue;
    }

    if (message.role === "assistant") {
      const containsOnlySupportedParts = message.parts.every(
        (part) =>
          part.type === "text" ||
          part.type === "step-start" ||
          part.type === "tool-fetchUrlMetadata",
      );

      if (!containsOnlySupportedParts) {
        return null;
      }

      const containsVisibleText = message.parts.some(
        (part) => part.type === "text" && part.text.trim().length > 0,
      );
      const containsMetadataTool = message.parts.some(
        (part) => part.type === "tool-fetchUrlMetadata",
      );

      if (containsVisibleText || containsMetadataTool) {
        normalizedMessages.push(message);
      }

      continue;
    }

    return null;
  }

  return normalizedMessages.length > 0 ? normalizedMessages : null;
}

function exceedsChatInputLimits(messages: ResearchAssistantUIMessage[]) {
  if (messages.length > MAX_CHAT_MESSAGES) {
    return true;
  }

  let conversationTextCharacters = 0;

  for (const message of messages) {
    for (const part of message.parts) {
      if (part.type !== "text") {
        continue;
      }

      if (part.text.length > MAX_TEXT_PART_CHARACTERS) {
        return true;
      }

      conversationTextCharacters += part.text.length;

      if (conversationTextCharacters > MAX_CONVERSATION_TEXT_CHARACTERS) {
        return true;
      }
    }
  }

  return false;
}

function invalidRequestResponse() {
  return Response.json({ error: INVALID_REQUEST_MESSAGE }, { status: 400 });
}

function oversizedRequestResponse() {
  return Response.json(
    { error: OVERSIZED_REQUEST_MESSAGE },
    { status: 413 },
  );
}

export async function POST(request: Request) {
  const bodyResult = await readBoundedJson(request);

  if (bodyResult.status === "too-large") {
    return oversizedRequestResponse();
  }

  if (bodyResult.status === "invalid") {
    return invalidRequestResponse();
  }

  const body = bodyResult.value;

  if (!isChatRequestBody(body)) {
    return invalidRequestResponse();
  }

  // Validate untrusted UI messages before they reach model-message conversion.
  const validation = await safeValidateUIMessages<ResearchAssistantUIMessage>({
    messages: body.messages,
    tools: researchAssistantTools,
  });

  if (!validation.success) {
    return invalidRequestResponse();
  }

  if (exceedsChatInputLimits(validation.data)) {
    return oversizedRequestResponse();
  }

  const normalizedMessages = normalizeConversation(validation.data);

  if (normalizedMessages === null) {
    return invalidRequestResponse();
  }

  try {
    const modelMessages = await convertToModelMessages(normalizedMessages, {
      tools: researchAssistantTools,
    });

    // Forward the request signal so the future client Stop action aborts generation.
    const result = streamText({
      model: researchAssistantModel,
      system: RESEARCH_ASSISTANT_SYSTEM_PROMPT,
      messages: modelMessages,
      maxOutputTokens: RESEARCH_ASSISTANT_MAX_OUTPUT_TOKENS,
      providerOptions: {
        google: RESEARCH_ASSISTANT_PROVIDER_OPTIONS,
      },
      tools: researchAssistantTools,
      stopWhen: stepCountIs(2),
      abortSignal: request.signal,
    });

    return result.toUIMessageStreamResponse({
      consumeSseStream: consumeStream,
      onError: () => STREAM_ERROR_MESSAGE,
    });
  } catch {
    return Response.json({ error: STREAM_ERROR_MESSAGE }, { status: 500 });
  }
}
