import { render, waitFor } from "@testing-library/react";
import type { UseChatHelpers } from "@ai-sdk/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResearchAssistantChatRuntime } from "@/components/research-assistant-chat-runtime";
import type {
  ResearchAssistantRuntimeActions,
  ResearchAssistantRuntimeSnapshot,
} from "@/components/research-assistant-chat-runtime-types";
import type { ResearchAssistantUIMessage } from "@/lib/ai/types";

type RuntimeChatState = Pick<
  UseChatHelpers<ResearchAssistantUIMessage>,
  | "messages"
  | "sendMessage"
  | "regenerate"
  | "status"
  | "stop"
  | "error"
  | "clearError"
>;

const chatMocks = vi.hoisted(() => ({
  useChat: vi.fn<() => RuntimeChatState>(),
  sendMessage: vi.fn<RuntimeChatState["sendMessage"]>(),
  regenerate: vi.fn<RuntimeChatState["regenerate"]>(),
  stop: vi.fn<RuntimeChatState["stop"]>(),
  clearError: vi.fn<RuntimeChatState["clearError"]>(),
}));

vi.mock("@ai-sdk/react", () => ({
  useChat: chatMocks.useChat,
}));

function setChatState({
  messages = [],
  status = "ready",
  error,
}: Partial<
  Pick<RuntimeChatState, "messages" | "status" | "error">
> = {}) {
  chatMocks.useChat.mockReturnValue({
    messages,
    status,
    error,
    sendMessage: chatMocks.sendMessage,
    regenerate: chatMocks.regenerate,
    stop: chatMocks.stop,
    clearError: chatMocks.clearError,
  });
}

function renderRuntime() {
  const actionChanges: Array<ResearchAssistantRuntimeActions | null> = [];
  const snapshots: ResearchAssistantRuntimeSnapshot[] = [];
  const onActionsChange = vi.fn(
    (actions: ResearchAssistantRuntimeActions | null) => {
      actionChanges.push(actions);
    },
  );
  const onSnapshotChange = vi.fn(
    (snapshot: ResearchAssistantRuntimeSnapshot) => {
      snapshots.push(snapshot);
    },
  );
  const result = render(
    <ResearchAssistantChatRuntime
      onActionsChange={onActionsChange}
      onSnapshotChange={onSnapshotChange}
    />,
  );

  return {
    ...result,
    actionChanges,
    onActionsChange,
    onSnapshotChange,
    snapshots,
  };
}

beforeEach(() => {
  chatMocks.useChat.mockReset();
  chatMocks.sendMessage.mockReset();
  chatMocks.sendMessage.mockResolvedValue(undefined);
  chatMocks.regenerate.mockReset();
  chatMocks.regenerate.mockResolvedValue(undefined);
  chatMocks.stop.mockReset();
  chatMocks.stop.mockResolvedValue(undefined);
  chatMocks.clearError.mockReset();
});

describe("ResearchAssistantChatRuntime", () => {
  it("instantiates useChat and publishes the initial snapshot", async () => {
    setChatState();

    const { snapshots } = renderRuntime();

    expect(chatMocks.useChat).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(snapshots).toHaveLength(1));
    expect(snapshots[0]).toEqual({
      messages: [],
      status: "ready",
      error: undefined,
    });
  });

  it("republishes message, status, and error updates", async () => {
    setChatState();
    const { rerender, snapshots, onActionsChange, onSnapshotChange } =
      renderRuntime();
    const assistantMessage = {
      id: "assistant-runtime",
      role: "assistant",
      parts: [{ type: "text", text: "A streamed update.", state: "done" }],
    } satisfies ResearchAssistantUIMessage;
    const runtimeError = new Error("Runtime failure");

    setChatState({
      messages: [assistantMessage],
      status: "error",
      error: runtimeError,
    });
    rerender(
      <ResearchAssistantChatRuntime
        onActionsChange={onActionsChange}
        onSnapshotChange={onSnapshotChange}
      />,
    );

    await waitFor(() => expect(snapshots).toHaveLength(2));
    expect(snapshots[1]).toEqual({
      messages: [assistantMessage],
      status: "error",
      error: runtimeError,
    });
  });

  it("clears an existing error before sending exactly once", async () => {
    setChatState({ error: new Error("Previous failure") });
    const { actionChanges } = renderRuntime();
    await waitFor(() => expect(actionChanges).toHaveLength(1));

    await actionChanges[0]?.send("Compare these options.");

    expect(chatMocks.clearError).toHaveBeenCalledTimes(1);
    expect(chatMocks.sendMessage).toHaveBeenCalledTimes(1);
    expect(chatMocks.sendMessage).toHaveBeenCalledWith({
      text: "Compare these options.",
    });
    expect(chatMocks.clearError.mock.invocationCallOrder[0]).toBeLessThan(
      chatMocks.sendMessage.mock.invocationCallOrder[0],
    );
  });

  it("does not clear an error unnecessarily when sending", async () => {
    setChatState();
    const { actionChanges } = renderRuntime();
    await waitFor(() => expect(actionChanges).toHaveLength(1));

    await actionChanges[0]?.send("Keep the current context.");

    expect(chatMocks.clearError).not.toHaveBeenCalled();
    expect(chatMocks.sendMessage).toHaveBeenCalledTimes(1);
  });

  it("keeps actions registered while send observes the latest error", async () => {
    setChatState();
    const { actionChanges, onActionsChange, onSnapshotChange, rerender } =
      renderRuntime();
    await waitFor(() => expect(actionChanges).toHaveLength(1));
    const actions = actionChanges[0];

    setChatState({ error: new Error("Latest failure") });
    rerender(
      <ResearchAssistantChatRuntime
        onActionsChange={onActionsChange}
        onSnapshotChange={onSnapshotChange}
      />,
    );

    expect(actionChanges).toEqual([actions]);
    await actions?.send("Retry with the latest error.");
    expect(chatMocks.clearError).toHaveBeenCalledTimes(1);
    expect(chatMocks.sendMessage).toHaveBeenCalledTimes(1);

    chatMocks.clearError.mockClear();
    chatMocks.sendMessage.mockClear();
    setChatState();
    rerender(
      <ResearchAssistantChatRuntime
        onActionsChange={onActionsChange}
        onSnapshotChange={onSnapshotChange}
      />,
    );

    expect(actionChanges).toEqual([actions]);
    await actions?.send("Continue without an error.");
    expect(chatMocks.clearError).not.toHaveBeenCalled();
    expect(chatMocks.sendMessage).toHaveBeenCalledTimes(1);
  });

  it("forwards stop and retry exactly once", async () => {
    setChatState();
    const { actionChanges } = renderRuntime();
    await waitFor(() => expect(actionChanges).toHaveLength(1));

    await actionChanges[0]?.stop();
    await actionChanges[0]?.retry();

    expect(chatMocks.stop).toHaveBeenCalledTimes(1);
    expect(chatMocks.regenerate).toHaveBeenCalledTimes(1);
  });

  it("unregisters actions on cleanup", async () => {
    setChatState();
    const { actionChanges, unmount } = renderRuntime();
    await waitFor(() => expect(actionChanges).toHaveLength(1));

    unmount();

    expect(actionChanges).toHaveLength(2);
    expect(actionChanges[1]).toBeNull();
  });

  it("keeps actions stable and avoids callback loops on unchanged rerenders", async () => {
    setChatState();
    const {
      actionChanges,
      onActionsChange,
      onSnapshotChange,
      rerender,
      snapshots,
    } = renderRuntime();
    await waitFor(() => {
      expect(actionChanges).toHaveLength(1);
      expect(snapshots).toHaveLength(1);
    });
    const initialActions = actionChanges[0];

    rerender(
      <ResearchAssistantChatRuntime
        onActionsChange={onActionsChange}
        onSnapshotChange={onSnapshotChange}
      />,
    );

    expect(actionChanges).toHaveLength(1);
    expect(actionChanges[0]).toBe(initialActions);
    expect(snapshots).toHaveLength(1);
  });
});
