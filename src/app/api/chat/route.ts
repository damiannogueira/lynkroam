import {
  consumeStream,
  convertToModelMessages,
  safeValidateUIMessages,
  streamText,
  type UIMessage,
} from "ai";
import {
  RESEARCH_ASSISTANT_MAX_OUTPUT_TOKENS,
  RESEARCH_ASSISTANT_PROVIDER_OPTIONS,
  RESEARCH_ASSISTANT_SYSTEM_PROMPT,
  researchAssistantModel,
} from "@/lib/ai/config";

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

function isTextConversation(messages: UIMessage[]) {
  return (
    messages.length > 0 &&
    messages.every((message) => {
      if (message.role !== "user" && message.role !== "assistant") {
        return false;
      }

      return (
        message.parts.every((part) => part.type === "text") &&
        message.parts.some(
          (part) => part.type === "text" && part.text.trim().length > 0,
        )
      );
    })
  );
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
  const validation = await safeValidateUIMessages({ messages: body.messages });

  if (!validation.success || !isTextConversation(validation.data)) {
    return invalidRequestResponse();
  }

  try {
    const modelMessages = await convertToModelMessages(validation.data);

    // Forward the request signal so the future client Stop action aborts generation.
    const result = streamText({
      model: researchAssistantModel,
      system: RESEARCH_ASSISTANT_SYSTEM_PROMPT,
      messages: modelMessages,
      maxOutputTokens: RESEARCH_ASSISTANT_MAX_OUTPUT_TOKENS,
      providerOptions: {
        google: RESEARCH_ASSISTANT_PROVIDER_OPTIONS,
      },
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
