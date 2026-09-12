"use client";

import { useEffect, useMemo, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import type { ResearchAssistantRuntimeControllerProps } from "@/components/research-assistant-chat-runtime-types";
import type { ResearchAssistantUIMessage } from "@/lib/ai/types";

export function ResearchAssistantChatRuntime({
  onActionsChange,
  onSnapshotChange,
}: ResearchAssistantRuntimeControllerProps) {
  const {
    messages,
    sendMessage,
    regenerate,
    status,
    stop,
    error,
    clearError,
  } = useChat<ResearchAssistantUIMessage>();
  const errorRef = useRef(error);

  useEffect(() => {
    errorRef.current = error;
  }, [error]);

  const actions = useMemo(
    () => ({
      send: async (text: string) => {
        if (errorRef.current) {
          clearError();
        }

        await sendMessage({ text });
      },
      stop: async () => {
        await stop();
      },
      retry: async () => {
        await regenerate();
      },
    }),
    [clearError, regenerate, sendMessage, stop],
  );

  useEffect(() => {
    onActionsChange(actions);

    return () => onActionsChange(null);
  }, [actions, onActionsChange]);

  useEffect(() => {
    onSnapshotChange({ messages, status, error });
  }, [error, messages, onSnapshotChange, status]);

  return null;
}
