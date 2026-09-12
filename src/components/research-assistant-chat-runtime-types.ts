import type { ResearchAssistantUIMessage } from "@/lib/ai/types";

export type ResearchAssistantRuntimeStatus =
  | "submitted"
  | "streaming"
  | "ready"
  | "error";

export type ResearchAssistantRuntimeSnapshot = {
  messages: ResearchAssistantUIMessage[];
  status: ResearchAssistantRuntimeStatus;
  error: Error | undefined;
};

export type ResearchAssistantRuntimeActions = {
  send: (text: string) => Promise<void>;
  stop: () => Promise<void>;
  retry: () => Promise<void>;
};

export type ResearchAssistantRuntimeControllerProps = {
  onActionsChange: (
    actions: ResearchAssistantRuntimeActions | null,
  ) => void;
  onSnapshotChange: (snapshot: ResearchAssistantRuntimeSnapshot) => void;
};
