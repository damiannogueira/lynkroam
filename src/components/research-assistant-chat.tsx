"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useChat } from "@ai-sdk/react";
import { FetchUrlMetadataTool } from "@/components/fetch-url-metadata-tool";
import type { ResearchAssistantUIMessage } from "@/lib/ai/types";

const NEAR_BOTTOM_THRESHOLD = 48;
const GENERIC_ERROR_MESSAGE =
  "The Research Assistant couldn't complete that response.";
const EXAMPLE_PROMPTS = [
  "Help me compare two travel priorities for this trip.",
  "What important research might I still be missing?",
  "Inspect this webpage source: https://example.com",
];

type AssistantTextSnapshot = {
  id: string;
  text: string;
};

type ResponseAnnouncement = {
  sequence: number;
  text: string;
};

function isNearBottom(container: HTMLDivElement) {
  return (
    container.scrollHeight - container.scrollTop - container.clientHeight <=
    NEAR_BOTTOM_THRESHOLD
  );
}

function newestAssistantHasVisibleContent(
  messages: ResearchAssistantUIMessage[],
) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role === "user") {
      return false;
    }

    if (message.role === "assistant") {
      return message.parts.some(
        (part) =>
          (part.type === "text" && part.text.trim().length > 0) ||
          part.type === "tool-fetchUrlMetadata",
      );
    }
  }

  return false;
}

function getNewestAssistantText(
  messages: ResearchAssistantUIMessage[],
): AssistantTextSnapshot | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role === "user") {
      return null;
    }

    if (message.role === "assistant") {
      return {
        id: message.id,
        text: message.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join(""),
      };
    }
  }

  return null;
}

function getCompleteSentenceLength(text: string) {
  for (let index = text.length - 1; index >= 0; index -= 1) {
    if (text[index] === "." || text[index] === "?" || text[index] === "!") {
      return index + 1;
    }
  }

  return 0;
}

export function ResearchAssistantChat() {
  const [input, setInput] = useState("");
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const conversationRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const isFollowingLatestRef = useRef(true);
  const previousScrollTopRef = useRef(0);
  const retryInFlightRef = useRef(false);
  const trackedAssistantMessageIdRef = useRef<string | null>(null);
  const announcedAssistantTextLengthRef = useRef(0);
  const announcementsInitializedRef = useRef(false);
  const responseAnnouncementSequenceRef = useRef(0);
  const [responseAnnouncement, setResponseAnnouncement] =
    useState<ResponseAnnouncement | null>(null);
  const {
    messages,
    sendMessage,
    regenerate,
    status,
    stop,
    error,
    clearError,
  } = useChat<ResearchAssistantUIMessage>();
  const isBusy = status === "submitted" || status === "streaming";
  const isWaitingForText =
    status === "submitted" ||
    (status === "streaming" &&
      !newestAssistantHasVisibleContent(messages));

  useEffect(() => {
    const conversation = conversationRef.current;

    if (conversation && isFollowingLatestRef.current) {
      conversation.scrollTop = conversation.scrollHeight;
      previousScrollTopRef.current = conversation.scrollTop;
    }
  }, [error, isWaitingForText, messages]);

  useEffect(() => {
    const assistantText = getNewestAssistantText(messages);
    const isInitialAnnouncementPass = !announcementsInitializedRef.current;
    announcementsInitializedRef.current = true;

    if (!assistantText) {
      return;
    }

    if (trackedAssistantMessageIdRef.current !== assistantText.id) {
      trackedAssistantMessageIdRef.current = assistantText.id;
      announcedAssistantTextLengthRef.current = 0;
      setResponseAnnouncement(null);
    }

    if (isInitialAnnouncementPass && status !== "streaming") {
      announcedAssistantTextLengthRef.current = assistantText.text.length;
      return;
    }

    const announcedLength = Math.min(
      announcedAssistantTextLengthRef.current,
      assistantText.text.length,
    );
    const unannouncedText = assistantText.text.slice(announcedLength);

    if (status === "streaming") {
      const completeSentenceLength = getCompleteSentenceLength(unannouncedText);

      if (completeSentenceLength === 0) {
        return;
      }

      announcedAssistantTextLengthRef.current =
        announcedLength + completeSentenceLength;
      const completeText = unannouncedText
        .slice(0, completeSentenceLength)
        .trim();

      if (completeText) {
        responseAnnouncementSequenceRef.current += 1;
        setResponseAnnouncement({
          sequence: responseAnnouncementSequenceRef.current,
          text: completeText,
        });
      }

      return;
    }

    if (status === "ready" || status === "error") {
      announcedAssistantTextLengthRef.current = assistantText.text.length;
      const remainingText = unannouncedText.trim();

      if (remainingText) {
        responseAnnouncementSequenceRef.current += 1;
        setResponseAnnouncement({
          sequence: responseAnnouncementSequenceRef.current,
          text: remainingText,
        });
      }
    }
  }, [messages, status]);

  function handleConversationScroll() {
    const conversation = conversationRef.current;

    if (!conversation) {
      return;
    }

    const currentScrollTop = conversation.scrollTop;
    const movedUp = currentScrollTop < previousScrollTopRef.current;
    previousScrollTopRef.current = currentScrollTop;

    if (movedUp) {
      isFollowingLatestRef.current = false;
      setShowJumpToLatest(true);
      return;
    }

    const shouldFollowLatest = isNearBottom(conversation);
    isFollowingLatestRef.current = shouldFollowLatest;
    setShowJumpToLatest(!shouldFollowLatest);
  }

  function handleJumpToLatest() {
    const conversation = conversationRef.current;

    if (!conversation) {
      return;
    }

    isFollowingLatestRef.current = true;
    setShowJumpToLatest(false);
    conversation.scrollTop = conversation.scrollHeight;
    previousScrollTopRef.current = conversation.scrollTop;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = input.trim();

    if (!text || isBusy) {
      return;
    }

    if (error) {
      clearError();
    }

    setInput("");
    void sendMessage({ text });
  }

  function handleExamplePrompt(prompt: string) {
    setInput(prompt);
    composerRef.current?.focus();
  }

  function handleRetry() {
    if (retryInFlightRef.current || isBusy) {
      return;
    }

    retryInFlightRef.current = true;
    void regenerate()
      .catch(() => undefined)
      .finally(() => {
        retryInFlightRef.current = false;
      });
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <section
      className="overflow-hidden rounded-panel border border-border bg-surface-elevated shadow-card"
      aria-label="Research Assistant conversation"
    >
      <div className="relative">
        <div
          className="max-h-[32rem] min-h-80 space-y-5 overflow-x-hidden overflow-y-auto p-4 sm:p-6"
          onScroll={handleConversationScroll}
          ref={conversationRef}
        >
          {messages.length === 0 ? (
            <div className="max-w-reading rounded-card border border-dashed border-border-strong bg-surface p-5 sm:p-6">
              <h3 className="text-body font-semibold text-ink">
                Make the next decision clearer
              </h3>
              <p className="mt-2 text-body text-muted">
                Ask the Research Assistant to compare your travel research,
                identify missing information, or reason through trade-offs.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    className="min-h-11 rounded-control border border-border-strong bg-surface-elevated px-3 py-2 text-left text-small font-semibold text-brand transition-colors hover:border-brand hover:bg-brand-soft"
                    key={prompt}
                    type="button"
                    onClick={() => handleExamplePrompt(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ol className="space-y-5">
              {messages.map((message) => {
                if (message.role !== "user" && message.role !== "assistant") {
                  return null;
                }

                const renderableParts = message.parts.filter(
                  (part) =>
                    part.type === "text" ||
                    (message.role === "assistant" &&
                      part.type === "tool-fetchUrlMetadata"),
                );

                if (renderableParts.length === 0) {
                  return null;
                }

                const isUser = message.role === "user";

                return (
                  <li
                    key={message.id}
                    className={
                      isUser ? "flex justify-end" : "flex justify-start"
                    }
                  >
                    <article
                      className={`w-fit max-w-reading rounded-card border p-4 sm:p-5 ${
                        isUser
                          ? "border-brand bg-brand text-brand-contrast"
                          : "border-border bg-surface text-ink"
                      }`}
                    >
                      <p
                        className={`text-small font-semibold uppercase tracking-[0.12em] ${
                          isUser ? "text-brand-contrast/80" : "text-brand"
                        }`}
                      >
                        {isUser ? "You" : "Research Assistant"}
                      </p>
                      <div className="mt-2 space-y-3 text-body">
                        {renderableParts.map((part, index) => {
                          if (part.type === "text") {
                            return (
                              <p
                                className="whitespace-pre-wrap break-words"
                                key={`${message.id}-text-${index}`}
                              >
                                {part.text}
                              </p>
                            );
                          }

                          if (part.type === "tool-fetchUrlMetadata") {
                            return (
                              <FetchUrlMetadataTool
                                key={part.toolCallId}
                                part={part}
                              />
                            );
                          }

                          return null;
                        })}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          )}

          {isWaitingForText ? (
            <div
              className="max-w-reading rounded-card border border-border bg-surface p-4 text-ink sm:p-5"
              role="status"
              aria-live="polite"
            >
              <p className="text-small font-semibold uppercase tracking-[0.12em] text-brand">
                Research Assistant
              </p>
              <p className="mt-2 text-label font-semibold text-muted">
                Research Assistant is thinking...
              </p>
              <div className="mt-4 space-y-3" aria-hidden="true">
                <span className="block h-3 w-full animate-pulse rounded-pill bg-brand-soft" />
                <span className="block h-3 w-5/6 animate-pulse rounded-pill bg-brand-soft" />
                <span className="block h-3 w-2/3 animate-pulse rounded-pill bg-brand-soft" />
              </div>
            </div>
          ) : null}

          {error ? (
            <div
              className="rounded-card border border-warning/40 bg-warning/10 p-4 text-body text-ink"
              role="alert"
            >
              <p className="font-semibold">Response interrupted</p>
              <p className="mt-2 text-small text-muted">
                {GENERIC_ERROR_MESSAGE} Retry only the failed assistant
                response, or write a new message below.
              </p>
              <button
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-control border border-warning bg-surface px-4 py-2 text-label font-semibold text-ink transition-colors hover:bg-warning/10 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={handleRetry}
                disabled={isBusy}
              >
                Retry response
              </button>
            </div>
          ) : null}
        </div>

        {showJumpToLatest ? (
          <button
            className="absolute bottom-4 left-1/2 min-h-11 -translate-x-1/2 rounded-pill border border-border-strong bg-surface-elevated px-4 py-2 text-label font-semibold text-brand shadow-card transition-colors hover:border-brand hover:bg-brand-soft"
            type="button"
            onClick={handleJumpToLatest}
          >
            Jump to latest
          </button>
        ) : null}
      </div>

      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label="Research Assistant response updates"
      >
        {responseAnnouncement ? (
          <span key={responseAnnouncement.sequence}>
            {responseAnnouncement.text}
          </span>
        ) : null}
      </div>

      <form
        className="border-t border-border bg-surface p-4 sm:p-6"
        onSubmit={handleSubmit}
      >
        <label
          className="text-label font-semibold text-ink"
          htmlFor="research-assistant-message"
        >
          Message
        </label>
        <textarea
          className="mt-2 min-h-28 w-full resize-y rounded-control border border-border-strong bg-surface-elevated px-4 py-3 text-body text-ink outline-none placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/25 disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted"
          id="research-assistant-message"
          name="message"
          ref={composerRef}
          placeholder="Ask about your travel research..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleComposerKeyDown}
          disabled={isBusy}
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-small text-muted">
            Ask the assistant to inspect page-level metadata when checking a
            webpage source.
          </p>
          {isBusy ? (
            <button
              className="inline-flex min-h-11 w-full items-center justify-center rounded-control border border-border-strong bg-surface px-5 py-3 text-label font-semibold text-ink transition-colors hover:border-accent hover:text-accent-strong sm:w-auto"
              type="button"
              onClick={() => void stop()}
            >
              Stop
            </button>
          ) : (
            <button
              className="inline-flex min-h-11 w-full items-center justify-center rounded-control bg-brand px-5 py-3 text-label font-semibold text-brand-contrast transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:bg-muted sm:w-auto"
              type="submit"
              disabled={input.trim().length === 0}
            >
              Send
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
