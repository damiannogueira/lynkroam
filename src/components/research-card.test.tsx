import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResearchCard } from "@/components/research-card";

describe("ResearchCard", () => {
  it("presents the research source and its decision context", () => {
    render(
      <ResearchCard
        title="A practical Barcelona neighborhood guide"
        category="Accommodation"
        sourceContext="Independent travel article"
        note="Compare Gracia with Eixample before choosing a base."
        decisionState="Shortlisted"
      />,
    );

    const card = screen.getByRole("article");

    expect(
      within(card).getByRole("heading", {
        level: 4,
        name: "A practical Barcelona neighborhood guide",
      }),
    ).toBeInTheDocument();
    expect(within(card).getByText("Accommodation")).toBeInTheDocument();
    expect(
      within(card).getByText("Independent travel article"),
    ).toBeInTheDocument();
    expect(
      within(card).getByText(
        "Compare Gracia with Eixample before choosing a base.",
      ),
    ).toBeInTheDocument();

    const decisionDetails = within(card).getByText("Decision state").parentElement;
    expect(decisionDetails).not.toBeNull();
    expect(within(decisionDetails!).getByText("Shortlisted")).toBeInTheDocument();
  });
});
