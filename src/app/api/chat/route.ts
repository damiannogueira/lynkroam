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
const STREAM_ERROR_MESSAGE =
  "The Research Assistant could not complete this response.";

type ChatRequestBody = {
  messages: unknown[];
};

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

function invalidRequestResponse() {
  return Response.json({ error: INVALID_REQUEST_MESSAGE }, { status: 400 });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return invalidRequestResponse();
  }

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
