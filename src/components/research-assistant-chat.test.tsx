import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResearchAssistantChat } from "@/components/research-assistant-chat";
import type {
  ResearchAssistantRuntimeActions,
  ResearchAssistantRuntimeControllerProps,
  ResearchAssistantRuntimeSnapshot,
} from "@/components/research-assistant-chat-runtime-types";
import type { ResearchAssistantUIMessage } from "@/lib/ai/types";

const runtimeMocks = vi.hoisted(() => ({
  controller: vi.fn(),
  controllerProps: null as ResearchAssistantRuntimeControllerProps | null,
  actions: {
    send: vi.fn<ResearchAssistantRuntimeActions["send"]>(),
    stop: vi.fn<ResearchAssistantRuntimeActions["stop"]>(),
    retry: vi.fn<ResearchAssistantRuntimeActions["retry"]>(),
  },
}));

vi.mock("@/components/research-assistant-chat-runtime", () => ({
  ResearchAssistantChatRuntime: (
    props: ResearchAssistantRuntimeControllerProps,
  ) => {
    runtimeMocks.controller(props);
    runtimeMocks.controllerProps = props;
    return null;
  },
}));

function createRuntimeSnapshot({
  messages = [],
  status = "ready",
  error,
}: Partial<ResearchAssistantRuntimeSnapshot> = {}): ResearchAssistantRuntimeSnapshot {
  return { messages, status, error };
}

function getRuntimeControllerProps() {
  const controllerProps = runtimeMocks.controllerProps;

  if (!controllerProps) {
    throw new Error("Research Assistant runtime controller was not mounted.");
  }

  return controllerProps;
}

function publishRuntimeSnapshot(snapshot: ResearchAssistantRuntimeSnapshot) {
  act(() => {
    getRuntimeControllerProps().onSnapshotChange(snapshot);
  });
}

function registerRuntimeActions() {
  act(() => {
    getRuntimeControllerProps().onActionsChange(runtimeMocks.actions);
  });
}

function renderChat(
  snapshot: ResearchAssistantRuntimeSnapshot = createRuntimeSnapshot(),
  { registerActions = true } = {},
) {
  const result = render(<ResearchAssistantChat />);

  publishRuntimeSnapshot(snapshot);

  if (registerActions) {
    registerRuntimeActions();
  }

  return result;
}

beforeEach(() => {
  runtimeMocks.controller.mockReset();
  runtimeMocks.controllerProps = null;
  runtimeMocks.actions.send.mockReset();
  runtimeMocks.actions.send.mockResolvedValue(undefined);
  runtimeMocks.actions.retry.mockReset();
  runtimeMocks.actions.retry.mockResolvedValue(undefined);
  runtimeMocks.actions.stop.mockReset();
  runtimeMocks.actions.stop.mockResolvedValue(undefined);
});

describe("ResearchAssistantChat response states", () => {
  it("mounts the runtime bridge eagerly while keeping the composer usable", async () => {
    const user = userEvent.setup();

    renderChat(createRuntimeSnapshot(), { registerActions: false });

    expect(runtimeMocks.controller).toHaveBeenCalled();
    const messageInput = screen.getByLabelText("Message");
    expect(messageInput).toBeEnabled();
    await user.type(messageInput, "The composer is immediately available.");
    expect(messageInput).toHaveValue("The composer is immediately available.");
  });

  it("queues one early submission until runtime actions register", async () => {
    const user = userEvent.setup();

    renderChat(createRuntimeSnapshot(), { registerActions: false });

    const messageInput = screen.getByLabelText("Message");
    await user.type(messageInput, "  Compare the neighborhoods.  ");
    await user.keyboard("{Enter}{Enter}");

    expect(runtimeMocks.actions.send).not.toHaveBeenCalled();
    expect(messageInput).toHaveValue("  Compare the neighborhoods.  ");

    registerRuntimeActions();

    await waitFor(() =>
      expect(runtimeMocks.actions.send).toHaveBeenCalledWith(
        "Compare the neighborhoods.",
      ),
    );
    expect(runtimeMocks.actions.send).toHaveBeenCalledTimes(1);
    expect(messageInput).toHaveValue("");
  });

  it("preserves composer edits made after an early submission is queued", async () => {
    const user = userEvent.setup();

    renderChat(createRuntimeSnapshot(), { registerActions: false });

    const messageInput = screen.getByLabelText("Message");
    await user.type(messageInput, "Compare the neighborhoods.");
    await user.keyboard("{Enter}");
    await user.type(messageInput, " Keep this follow-up draft.");

    registerRuntimeActions();

    await waitFor(() =>
      expect(runtimeMocks.actions.send).toHaveBeenCalledWith(
        "Compare the neighborhoods.",
      ),
    );
    expect(runtimeMocks.actions.send).toHaveBeenCalledTimes(1);
    expect(messageInput).toHaveValue(
      "Compare the neighborhoods. Keep this follow-up draft.",
    );
  });

  it("preserves whitespace-only edits made after queuing", async () => {
    const user = userEvent.setup();

    renderChat(createRuntimeSnapshot(), { registerActions: false });

    const messageInput = screen.getByLabelText("Message");
    await user.type(messageInput, "Hello");
    await user.keyboard("{Enter}");
    await user.type(messageInput, "   ");

    registerRuntimeActions();

    await waitFor(() =>
      expect(runtimeMocks.actions.send).toHaveBeenCalledWith("Hello"),
    );
    expect(runtimeMocks.actions.send).toHaveBeenCalledTimes(1);
    expect(messageInput).toHaveValue("Hello   ");
  });

  it("prevents duplicate Send-button submissions while one is queued", async () => {
    const user = userEvent.setup();

    renderChat(createRuntimeSnapshot(), { registerActions: false });

    const messageInput = screen.getByLabelText("Message");
    await user.type(messageInput, "Compare these options.");
    const sendButton = screen.getByRole("button", { name: "Send" });
    await user.click(sendButton);
    await user.click(sendButton);

    expect(runtimeMocks.actions.send).not.toHaveBeenCalled();
    registerRuntimeActions();

    await waitFor(() =>
      expect(runtimeMocks.actions.send).toHaveBeenCalledWith(
        "Compare these options.",
      ),
    );
    expect(runtimeMocks.actions.send).toHaveBeenCalledTimes(1);
  });

  it("preserves the textarea DOM node when the runtime bridge becomes ready", () => {
    renderChat(createRuntimeSnapshot(), { registerActions: false });

    const messageInput = screen.getByLabelText("Message");
    publishRuntimeSnapshot(
      createRuntimeSnapshot({ status: "submitted" }),
    );
    registerRuntimeActions();
    publishRuntimeSnapshot(createRuntimeSnapshot());

    expect(screen.getByLabelText("Message")).toBe(messageInput);
  });

  it("fills and focuses a starter prompt without sending", async () => {
    const user = userEvent.setup();
    renderChat();

    await user.click(
      screen.getByRole("button", {
        name: "Help me compare two travel priorities for this trip.",
      }),
    );

    const messageInput = screen.getByLabelText("Message");
    expect(messageInput).toHaveValue(
      "Help me compare two travel priorities for this trip.",
    );
    expect(messageInput).toHaveFocus();
    expect(runtimeMocks.actions.send).not.toHaveBeenCalled();
  });

  it("shows pending feedback and busy controls after submission", () => {
    const userMessage = {
      id: "user-submitted",
      role: "user",
      parts: [{ type: "text", text: "Compare these travel priorities." }],
    } satisfies ResearchAssistantUIMessage;

    renderChat(
      createRuntimeSnapshot({
        messages: [userMessage],
        status: "submitted",
      }),
    );

    const pendingStatus = screen
      .getAllByRole("status")
      .find((status) =>
        within(status).queryByText("Research Assistant is thinking..."),
      );
    expect(pendingStatus).toBeDefined();
    if (!pendingStatus) {
      throw new Error("Pending status was not rendered.");
    }
    expect(
      within(pendingStatus).getByText("Research Assistant is thinking..."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stop" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Send" }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeDisabled();
  });

  it("keeps pending feedback while streaming has no visible content", () => {
    const structuralAssistantMessage = {
      id: "assistant-structural",
      role: "assistant",
      parts: [{ type: "step-start" }],
    } satisfies ResearchAssistantUIMessage;

    renderChat(
      createRuntimeSnapshot({
        messages: [structuralAssistantMessage],
        status: "streaming",
      }),
    );

    const pendingStatus = screen
      .getAllByRole("status")
      .find((status) =>
        within(status).queryByText("Research Assistant is thinking..."),
      );
    expect(pendingStatus).toBeDefined();
    if (!pendingStatus) {
      throw new Error("Pending status was not rendered.");
    }
    expect(
      within(pendingStatus).getByText("Research Assistant is thinking..."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stop" })).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("renders visible assistant text while streaming without pending feedback", () => {
    const streamingAssistantMessage = {
      id: "assistant-streaming",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "A deterministic streaming response.",
          state: "streaming",
        },
      ],
    } satisfies ResearchAssistantUIMessage;

    renderChat(
      createRuntimeSnapshot({
        messages: [streamingAssistantMessage],
        status: "streaming",
      }),
    );

    expect(
      within(screen.getByRole("article")).getByText(
        "A deterministic streaming response.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Research Assistant is thinking..."),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stop" })).toBeInTheDocument();
  });

  it("announces completed streamed sentences and flushes the remaining text", async () => {
    const user = userEvent.setup();
    const streamingMessage = (text: string, state: "streaming" | "done") =>
      ({
        id: "assistant-announcement",
        role: "assistant",
        parts: [{ type: "text", text, state }],
      }) satisfies ResearchAssistantUIMessage;

    const { rerender } = renderChat(
      createRuntimeSnapshot({
        messages: [streamingMessage("An incomplete response", "streaming")],
        status: "streaming",
      }),
    );
    const responseUpdates = screen.getByRole("status", {
      name: "Research Assistant response updates",
    });

    expect(responseUpdates).toBeEmptyDOMElement();
    expect(screen.getByText("An incomplete response")).toBeInTheDocument();

    const stopButton = screen.getByRole("button", { name: "Stop" });
    await user.click(stopButton);
    expect(runtimeMocks.actions.stop).toHaveBeenCalledTimes(1);

    publishRuntimeSnapshot(
      createRuntimeSnapshot({
        messages: [
          streamingMessage(
            "An incomplete response is now complete.",
            "streaming",
          ),
        ],
        status: "streaming",
      }),
    );

    await waitFor(() =>
      expect(responseUpdates).toHaveTextContent(
        "An incomplete response is now complete.",
      ),
    );

    publishRuntimeSnapshot(
      createRuntimeSnapshot({
        messages: [
          streamingMessage(
            "An incomplete response is now complete. A second sentence! trailing words",
            "streaming",
          ),
        ],
        status: "streaming",
      }),
    );

    await waitFor(() =>
      expect(responseUpdates).toHaveTextContent("A second sentence!"),
    );
    expect(responseUpdates).not.toHaveTextContent(
      "An incomplete response is now complete.",
    );

    publishRuntimeSnapshot(
      createRuntimeSnapshot({
        messages: [
          streamingMessage(
            "An incomplete response is now complete. A second sentence! trailing words",
            "done",
          ),
        ],
      }),
    );

    await waitFor(() =>
      expect(responseUpdates).toHaveTextContent("trailing words"),
    );
    expect(responseUpdates).not.toHaveTextContent("A second sentence!");
    expect(
      screen.getByText(
        "An incomplete response is now complete. A second sentence! trailing words",
      ),
    ).toBeInTheDocument();

    rerender(<ResearchAssistantChat />);
    expect(responseUpdates).toHaveTextContent("trailing words");
  });

  it("replaces the live-region node for identical consecutive announcements", async () => {
    const streamingMessage = (text: string) =>
      ({
        id: "assistant-repeated-announcement",
        role: "assistant",
        parts: [{ type: "text", text, state: "streaming" }],
      }) satisfies ResearchAssistantUIMessage;

    renderChat(
      createRuntimeSnapshot({
        messages: [streamingMessage("Yes.")],
        status: "streaming",
      }),
    );
    const responseUpdates = screen.getByRole("status", {
      name: "Research Assistant response updates",
    });

    await waitFor(() => expect(responseUpdates).toHaveTextContent("Yes."));
    const firstAnnouncement = responseUpdates.firstElementChild;
    expect(firstAnnouncement).not.toBeNull();

    publishRuntimeSnapshot(
      createRuntimeSnapshot({
        messages: [streamingMessage("Yes. Yes.")],
        status: "streaming",
      }),
    );

    await waitFor(() =>
      expect(responseUpdates.firstElementChild).not.toBe(firstAnnouncement),
    );
    expect(responseUpdates).toHaveTextContent("Yes.");
    expect(screen.getByText("Yes. Yes.")).toBeInTheDocument();
  });

  it("flushes an unpunctuated streaming remainder when the response errors", async () => {
    const partialAssistantMessage = {
      id: "assistant-error-announcement",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "A partial response",
          state: "streaming",
        },
      ],
    } satisfies ResearchAssistantUIMessage;

    const { rerender } = renderChat(
      createRuntimeSnapshot({
        messages: [partialAssistantMessage],
        status: "streaming",
      }),
    );
    const responseUpdates = screen.getByRole("status", {
      name: "Research Assistant response updates",
    });
    expect(responseUpdates).toBeEmptyDOMElement();

    publishRuntimeSnapshot(
      createRuntimeSnapshot({
        messages: [partialAssistantMessage],
        status: "error",
        error: new Error("Provider stream failed"),
      }),
    );

    await waitFor(() =>
      expect(responseUpdates).toHaveTextContent("A partial response"),
    );
    const flushedAnnouncement = responseUpdates.firstElementChild;

    rerender(<ResearchAssistantChat />);
    expect(responseUpdates.firstElementChild).toBe(flushedAnnouncement);
    expect(
      within(screen.getByRole("article")).getByText("A partial response"),
    ).toBeInTheDocument();
  });

  it("retains partial output and retries only the failed assistant response", async () => {
    const user = userEvent.setup();
    const partialAssistantMessage = {
      id: "assistant-partial",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "This partial answer remains visible.",
          state: "done",
        },
      ],
    } satisfies ResearchAssistantUIMessage;

    renderChat(
      createRuntimeSnapshot({
        messages: [partialAssistantMessage],
        status: "error",
        error: new Error("Sensitive provider failure"),
      }),
    );

    expect(
      within(screen.getByRole("article")).getByText(
        "This partial answer remains visible.",
      ),
    ).toBeInTheDocument();
    const alert = screen.getByRole("alert");
    expect(within(alert).getByText("Response interrupted")).toBeInTheDocument();

    const retryButton = within(alert).getByRole("button", {
      name: "Retry response",
    });
    await user.click(retryButton);

    expect(runtimeMocks.actions.retry).toHaveBeenCalledTimes(1);
    expect(runtimeMocks.actions.send).not.toHaveBeenCalled();
  });

  it("validates and trims the composer message before sending", async () => {
    const user = userEvent.setup();

    renderChat();

    const messageInput = screen.getByLabelText("Message");
    const sendButton = screen.getByRole("button", { name: "Send" });
    expect(sendButton).toBeDisabled();

    await user.type(messageInput, "   ");
    expect(sendButton).toBeDisabled();
    await user.keyboard("{Enter}");
    expect(runtimeMocks.actions.send).not.toHaveBeenCalled();

    await user.clear(messageInput);
    await user.type(messageInput, "  Compare location and room size.  ");
    expect(sendButton).toBeEnabled();

    await user.click(sendButton);

    expect(runtimeMocks.actions.send).toHaveBeenCalledWith(
      "Compare location and room size.",
    );
    expect(runtimeMocks.actions.send).toHaveBeenCalledTimes(1);
    expect(messageInput).toHaveValue("");
  });

  it("keeps Shift+Enter as a newline and uses Enter to send", async () => {
    const user = userEvent.setup();

    renderChat();

    const messageInput = screen.getByLabelText("Message");
    await user.type(messageInput, "Compare location");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    await user.type(messageInput, "and room size.");

    expect(messageInput).toHaveValue("Compare location\nand room size.");
    expect(runtimeMocks.actions.send).not.toHaveBeenCalled();

    await user.keyboard("{Enter}");

    expect(runtimeMocks.actions.send).toHaveBeenCalledWith(
      "Compare location\nand room size.",
    );
    expect(runtimeMocks.actions.send).toHaveBeenCalledTimes(1);
    expect(messageInput).toHaveValue("");
  });

  it("renders a populated metadata tool result inside assistant messages", () => {
    const metadataAssistantMessage = {
      id: "assistant-metadata",
      role: "assistant",
      parts: [
        {
          type: "tool-fetchUrlMetadata",
          toolCallId: "metadata-chat-result",
          state: "output-available",
          input: { url: "https://example.com/article" },
          output: {
            url: "https://example.com/article",
            hostname: "example.com",
            title: "A city research source",
            description: "A useful source for comparing travel options.",
            siteName: "Example Travel",
          },
        },
      ],
    } satisfies ResearchAssistantUIMessage;

    renderChat(
      createRuntimeSnapshot({ messages: [metadataAssistantMessage] }),
    );

    const toolStatus = screen
      .getAllByRole("status")
      .find((status) => within(status).queryByText("Source metadata ready"));
    expect(toolStatus).toBeDefined();
    if (!toolStatus) {
      throw new Error("Metadata tool status was not rendered.");
    }
    expect(
      within(toolStatus).getByText("Source metadata ready"),
    ).toBeInTheDocument();
    expect(
      within(toolStatus).getByRole("heading", {
        name: "A city research source",
      }),
    ).toBeInTheDocument();
    expect(
      within(toolStatus).getByText(
        "A useful source for comparing travel options.",
      ),
    ).toBeInTheDocument();
    expect(
      within(toolStatus).getByRole("link", { name: "Open source" }),
    ).toHaveAttribute("href", "https://example.com/article");
  });
});
