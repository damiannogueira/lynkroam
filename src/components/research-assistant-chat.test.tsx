import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UseChatHelpers } from "@ai-sdk/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResearchAssistantChat } from "@/components/research-assistant-chat";
import type { ResearchAssistantUIMessage } from "@/lib/ai/types";

type ResearchAssistantChatState = Pick<
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
  useChat: vi.fn<() => ResearchAssistantChatState>(),
  sendMessage: vi.fn<ResearchAssistantChatState["sendMessage"]>(),
  regenerate: vi.fn<ResearchAssistantChatState["regenerate"]>(),
  stop: vi.fn<ResearchAssistantChatState["stop"]>(),
  clearError: vi.fn<ResearchAssistantChatState["clearError"]>(),
}));

vi.mock("@ai-sdk/react", () => ({
  useChat: chatMocks.useChat,
}));

function setChatState({
  messages,
  status,
  error,
}: Pick<ResearchAssistantChatState, "messages" | "status" | "error">) {
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

beforeEach(() => {
  chatMocks.useChat.mockReset();
  chatMocks.sendMessage.mockReset();
  chatMocks.sendMessage.mockResolvedValue(undefined);
  chatMocks.regenerate.mockReset();
  chatMocks.regenerate.mockResolvedValue(undefined);
  chatMocks.stop.mockReset();
  chatMocks.clearError.mockReset();
});

describe("ResearchAssistantChat response states", () => {
  it("shows pending feedback and busy controls after submission", () => {
    const userMessage = {
      id: "user-submitted",
      role: "user",
      parts: [{ type: "text", text: "Compare these travel priorities." }],
    } satisfies ResearchAssistantUIMessage;

    setChatState({
      messages: [userMessage],
      status: "submitted",
      error: undefined,
    });

    render(<ResearchAssistantChat />);

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

    setChatState({
      messages: [structuralAssistantMessage],
      status: "streaming",
      error: undefined,
    });

    render(<ResearchAssistantChat />);

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

    setChatState({
      messages: [streamingAssistantMessage],
      status: "streaming",
      error: undefined,
    });

    render(<ResearchAssistantChat />);

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

    setChatState({
      messages: [streamingMessage("An incomplete response", "streaming")],
      status: "streaming",
      error: undefined,
    });

    const { rerender } = render(<ResearchAssistantChat />);
    const responseUpdates = screen.getByRole("status", {
      name: "Research Assistant response updates",
    });

    expect(responseUpdates).toBeEmptyDOMElement();
    expect(screen.getByText("An incomplete response")).toBeInTheDocument();

    const stopButton = screen.getByRole("button", { name: "Stop" });
    await user.click(stopButton);
    expect(chatMocks.stop).toHaveBeenCalledTimes(1);

    setChatState({
      messages: [streamingMessage("An incomplete response is now complete.", "streaming")],
      status: "streaming",
      error: undefined,
    });
    rerender(<ResearchAssistantChat />);

    await waitFor(() =>
      expect(responseUpdates).toHaveTextContent(
        "An incomplete response is now complete.",
      ),
    );

    setChatState({
      messages: [
        streamingMessage(
          "An incomplete response is now complete. A second sentence! trailing words",
          "streaming",
        ),
      ],
      status: "streaming",
      error: undefined,
    });
    rerender(<ResearchAssistantChat />);

    await waitFor(() =>
      expect(responseUpdates).toHaveTextContent("A second sentence!"),
    );
    expect(responseUpdates).not.toHaveTextContent(
      "An incomplete response is now complete.",
    );

    setChatState({
      messages: [
        streamingMessage(
          "An incomplete response is now complete. A second sentence! trailing words",
          "done",
        ),
      ],
      status: "ready",
      error: undefined,
    });
    rerender(<ResearchAssistantChat />);

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

    setChatState({
      messages: [streamingMessage("Yes.")],
      status: "streaming",
      error: undefined,
    });

    const { rerender } = render(<ResearchAssistantChat />);
    const responseUpdates = screen.getByRole("status", {
      name: "Research Assistant response updates",
    });

    await waitFor(() => expect(responseUpdates).toHaveTextContent("Yes."));
    const firstAnnouncement = responseUpdates.firstElementChild;
    expect(firstAnnouncement).not.toBeNull();

    setChatState({
      messages: [streamingMessage("Yes. Yes.")],
      status: "streaming",
      error: undefined,
    });
    rerender(<ResearchAssistantChat />);

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

    setChatState({
      messages: [partialAssistantMessage],
      status: "streaming",
      error: undefined,
    });

    const { rerender } = render(<ResearchAssistantChat />);
    const responseUpdates = screen.getByRole("status", {
      name: "Research Assistant response updates",
    });
    expect(responseUpdates).toBeEmptyDOMElement();

    setChatState({
      messages: [partialAssistantMessage],
      status: "error",
      error: new Error("Provider stream failed"),
    });
    rerender(<ResearchAssistantChat />);

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

    setChatState({
      messages: [partialAssistantMessage],
      status: "error",
      error: new Error("Sensitive provider failure"),
    });

    render(<ResearchAssistantChat />);

    expect(
      screen.getByText("This partial answer remains visible."),
    ).toBeInTheDocument();
    const alert = screen.getByRole("alert");
    expect(within(alert).getByText("Response interrupted")).toBeInTheDocument();

    const retryButton = within(alert).getByRole("button", {
      name: "Retry response",
    });
    await user.click(retryButton);

    expect(chatMocks.regenerate).toHaveBeenCalledTimes(1);
    expect(chatMocks.sendMessage).not.toHaveBeenCalled();
  });

  it("validates and trims the composer message before sending", async () => {
    const user = userEvent.setup();

    setChatState({
      messages: [],
      status: "ready",
      error: undefined,
    });

    render(<ResearchAssistantChat />);

    const messageInput = screen.getByLabelText("Message");
    const sendButton = screen.getByRole("button", { name: "Send" });
    expect(sendButton).toBeDisabled();

    await user.type(messageInput, "   ");
    expect(sendButton).toBeDisabled();
    await user.keyboard("{Enter}");
    expect(chatMocks.sendMessage).not.toHaveBeenCalled();

    await user.clear(messageInput);
    await user.type(messageInput, "  Compare location and room size.  ");
    expect(sendButton).toBeEnabled();

    await user.click(sendButton);

    expect(chatMocks.sendMessage).toHaveBeenCalledWith({
      text: "Compare location and room size.",
    });
    expect(chatMocks.sendMessage).toHaveBeenCalledTimes(1);
    expect(messageInput).toHaveValue("");
  });

  it("keeps Shift+Enter as a newline and uses Enter to send", async () => {
    const user = userEvent.setup();

    setChatState({
      messages: [],
      status: "ready",
      error: undefined,
    });

    render(<ResearchAssistantChat />);

    const messageInput = screen.getByLabelText("Message");
    await user.type(messageInput, "Compare location");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    await user.type(messageInput, "and room size.");

    expect(messageInput).toHaveValue("Compare location\nand room size.");
    expect(chatMocks.sendMessage).not.toHaveBeenCalled();

    await user.keyboard("{Enter}");

    expect(chatMocks.sendMessage).toHaveBeenCalledWith({
      text: "Compare location\nand room size.",
    });
    expect(chatMocks.sendMessage).toHaveBeenCalledTimes(1);
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

    setChatState({
      messages: [metadataAssistantMessage],
      status: "ready",
      error: undefined,
    });

    render(<ResearchAssistantChat />);

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
