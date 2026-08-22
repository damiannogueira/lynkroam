import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FetchUrlMetadataTool } from "@/components/fetch-url-metadata-tool";
import type { ResearchAssistantUIMessage } from "@/lib/ai/types";

type FetchUrlMetadataPart = Extract<
  ResearchAssistantUIMessage["parts"][number],
  { type: "tool-fetchUrlMetadata" }
>;

describe("FetchUrlMetadataTool", () => {
  it("communicates while the source URL input is streaming", () => {
    const part = {
      type: "tool-fetchUrlMetadata",
      toolCallId: "metadata-streaming",
      state: "input-streaming",
      input: { url: "https://example.com/art" },
    } satisfies FetchUrlMetadataPart;

    render(<FetchUrlMetadataTool part={part} />);

    const status = screen.getByRole("status");
    expect(
      within(status).getByText("Preparing source inspection"),
    ).toBeInTheDocument();
    expect(
      within(status).getByText("https://example.com/art"),
    ).toBeInTheDocument();
  });

  it("shows the source details when tool input is available", () => {
    const part = {
      type: "tool-fetchUrlMetadata",
      toolCallId: "metadata-input",
      state: "input-available",
      input: { url: "https://example.com/article" },
    } satisfies FetchUrlMetadataPart;

    render(<FetchUrlMetadataTool part={part} />);

    const status = screen.getByRole("status");
    expect(within(status).getByText("Inspecting source")).toBeInTheDocument();
    expect(within(status).getByText("example.com")).toBeInTheDocument();
    expect(
      within(status).getByText("https://example.com/article"),
    ).toBeInTheDocument();
  });

  it("presents populated source metadata and a safe external link", () => {
    const part = {
      type: "tool-fetchUrlMetadata",
      toolCallId: "metadata-success",
      state: "output-available",
      input: { url: "https://example.com/article" },
      output: {
        url: "https://example.com/article?source=lynkroam",
        hostname: "example.com",
        title: "A practical city guide",
        description: "Research notes for comparing neighborhoods.",
        siteName: "Example Travel",
      },
    } satisfies FetchUrlMetadataPart;

    render(<FetchUrlMetadataTool part={part} />);

    const status = screen.getByRole("status");
    expect(
      within(status).getByText("Source metadata ready"),
    ).toBeInTheDocument();
    expect(
      within(status).getByRole("heading", {
        name: "A practical city guide",
      }),
    ).toBeInTheDocument();
    expect(
      within(status).getByText("Research notes for comparing neighborhoods."),
    ).toBeInTheDocument();
    expect(
      within(status).getByText("Example Travel · example.com"),
    ).toBeInTheDocument();

    const sourceLink = within(status).getByRole("link", {
      name: "Open source",
    });
    expect(sourceLink).toHaveAttribute(
      "href",
      "https://example.com/article?source=lynkroam",
    );
    expect(sourceLink).toHaveAttribute("target", "_blank");
    const relTokens = sourceLink.getAttribute("rel")?.split(/\s+/) ?? [];
    expect(relTokens).toContain("noopener");
    expect(relTokens).toContain("noreferrer");
  });

  it("distinguishes a successful source with no descriptive metadata", () => {
    const part = {
      type: "tool-fetchUrlMetadata",
      toolCallId: "metadata-empty",
      state: "output-available",
      input: { url: "https://example.com/empty" },
      output: {
        url: "https://example.com/empty",
        hostname: "example.com",
        title: null,
        description: null,
        siteName: null,
      },
    } satisfies FetchUrlMetadataPart;

    render(<FetchUrlMetadataTool part={part} />);

    const status = screen.getByRole("status");
    expect(
      within(status).getByText("No descriptive metadata found"),
    ).toBeInTheDocument();
    expect(
      within(status).getByText(/the page was reached successfully/i),
    ).toBeInTheDocument();
    expect(within(status).getByText("example.com")).toBeInTheDocument();
    expect(
      within(status).getByRole("link", { name: "Open source" }),
    ).toHaveAttribute("href", "https://example.com/empty");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Source inspection failed"),
    ).not.toBeInTheDocument();
  });

  it("shows safe recovery guidance without exposing a raw tool error", () => {
    const part = {
      type: "tool-fetchUrlMetadata",
      toolCallId: "metadata-error",
      state: "output-error",
      input: { url: "https://example.com/article" },
      errorText: "SECRET_INTERNAL_METADATA_FAILURE_123",
    } satisfies FetchUrlMetadataPart;

    render(<FetchUrlMetadataTool part={part} />);

    const alert = screen.getByRole("alert");
    expect(
      within(alert).getByText("Source inspection failed"),
    ).toBeInTheDocument();
    expect(
      within(alert).getByText(/check the URL or try another public webpage/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("SECRET_INTERNAL_METADATA_FAILURE_123"),
    ).not.toBeInTheDocument();
  });
});
