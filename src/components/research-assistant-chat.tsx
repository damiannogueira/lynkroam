"use client";

import { useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";

const GENERIC_ERROR_MESSAGE =
  "The Research Assistant couldn't complete that response. You can try another message.";

function newestAssistantHasText(messages: UIMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role === "user") {
      return false;
    }

    if (message.role === "assistant") {
      return message.parts.some(
        (part) => part.type === "text" && part.text.trim().length > 0,
      );
    }
  }

  return false;
}

export function ResearchAssistantChat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, stop, error, clearError } = useChat();
  const isBusy = status === "submitted" || status === "streaming";
  const isWaitingForText =
    status === "submitted" ||
    (status === "streaming" && !newestAssistantHasText(messages));

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

  return (
    <section
      className="overflow-hidden rounded-panel border border-border bg-surface-elevated shadow-card"
      aria-label="Research Assistant conversation"
    >
      <div className="min-h-80 space-y-5 p-4 sm:p-6">
        {messages.length === 0 ? (
          <div className="max-w-reading rounded-card border border-dashed border-border-strong bg-surface p-5 sm:p-6">
            <h3 className="text-body font-semibold text-ink">
              Make the next decision clearer
            </h3>
            <p className="mt-2 text-body text-muted">
              Ask the Research Assistant to compare your travel research,
              identify missing information, or reason through trade-offs.
            </p>
          </div>
        ) : (
          <ol className="space-y-5">
            {messages.map((message) => {
              if (message.role !== "user" && message.role !== "assistant") {
                return null;
              }

              const textParts = message.parts.filter(
                (part) => part.type === "text",
              );

              if (textParts.length === 0) {
                return null;
              }

              const isUser = message.role === "user";

              return (
                <li
                  key={message.id}
                  className={isUser ? "flex justify-end" : "flex justify-start"}
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
                      {textParts.map((part, index) => (
                        <p
                          className="whitespace-pre-wrap break-words"
                          key={`${message.id}-text-${index}`}
                        >
                          {part.text}
                        </p>
                      ))}
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        )}

        {isWaitingForText ? (
          <p
            className="flex items-center gap-3 text-label font-semibold text-muted"
            role="status"
            aria-live="polite"
          >
            <span
              className="h-2.5 w-2.5 rounded-pill bg-brand"
              aria-hidden="true"
            />
            Research Assistant is thinking...
          </p>
        ) : null}

        {error ? (
          <div
            className="rounded-card border border-warning/40 bg-warning/10 p-4 text-body text-ink"
            role="alert"
          >
            {GENERIC_ERROR_MESSAGE}
          </div>
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
          placeholder="Ask about your travel research..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={isBusy}
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-small text-muted">
            Responses use only the context shared in this conversation.
          </p>
          {isBusy ? (
            <button
              className="inline-flex min-h-11 w-full items-center justify-center rounded-control border border-border-strong bg-surface px-5 py-3 text-label font-semibold text-ink transition-colors hover:border-accent hover:text-accent sm:w-auto"
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
