import type { InferUITools, UIMessage } from "ai";
import type { researchAssistantTools } from "@/lib/ai/tools";

export type ResearchAssistantUIMessage = UIMessage<
  unknown,
  never,
  InferUITools<typeof researchAssistantTools>
>;
