import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusColumn } from "@/components/status-column";
import type { ResearchCardData } from "@/components/research-card";

const consideringCard: ResearchCardData = {
  title: "Barcelona neighborhood guide",
  category: "Accommodation",
  sourceContext: "Independent travel article",
  note: "Compare neighborhood trade-offs.",
  decisionState: "Considering",
};

describe("StatusColumn", () => {
  it("labels the column and renders one research card", () => {
    render(
      <StatusColumn
        status="Considering"
        explanation="Options that still need comparison."
        cards={[consideringCard]}
      />,
    );

    const column = screen.getByRole("region", { name: "Considering" });

    expect(
      within(column).getByRole("heading", { level: 3, name: "Considering" }),
    ).toBeInTheDocument();
    expect(
      within(column).getByText("Options that still need comparison."),
    ).toBeInTheDocument();
    expect(within(column).getByText("1 research card")).toBeInTheDocument();
    expect(within(column).getByRole("article")).toHaveTextContent(
      "Barcelona neighborhood guide",
    );
  });

  it("uses the plural count for multiple research cards", () => {
    render(
      <StatusColumn
        status="Considering"
        explanation="Options that still need comparison."
        cards={[
          consideringCard,
          { ...consideringCard, title: "Barcelona hotel comparison" },
        ]}
      />,
    );

    const column = screen.getByRole("region", { name: "Considering" });
    expect(within(column).getByText("2 research cards")).toBeInTheDocument();
    expect(within(column).getAllByRole("article")).toHaveLength(2);
  });

  it("shows a useful empty state when the column has no cards", () => {
    render(
      <StatusColumn
        status="Booked"
        explanation="Confirmed choices for the trip."
        cards={[]}
      />,
    );

    const column = screen.getByRole("region", { name: "Booked" });
    expect(within(column).getByText("0 research cards")).toBeInTheDocument();
    expect(
      within(column).getByText(
        "No sample sources are in the booked state yet.",
      ),
    ).toBeInTheDocument();
    expect(within(column).queryByRole("article")).not.toBeInTheDocument();
  });
});
