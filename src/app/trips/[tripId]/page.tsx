import Link from "next/link";
import {
  type DecisionState,
  type ResearchCardData,
} from "@/components/research-card";
import { StatusColumn } from "@/components/status-column";

const workspaceColumns: {
  status: DecisionState;
  explanation: string;
  cards: ResearchCardData[];
}[] = [
  {
    status: "Inbox",
    explanation: "New sources waiting to be reviewed and classified.",
    cards: [
      {
        title: "Neighborhood food notes",
        category: "Food",
        sourceContext: "local-table.example / Gràcia guide",
        note: "Compare casual dinner areas and keep vegetarian options visible.",
        decisionState: "Inbox",
      },
      {
        title: "Independent architecture overview",
        category: "Guide",
        sourceContext: "city-notes.example / modernist route",
        note: "Useful context for grouping architecture stops by neighborhood.",
        decisionState: "Inbox",
      },
    ],
  },
  {
    status: "Considering",
    explanation: "Promising options that still need comparison.",
    cards: [
      {
        title: "Eixample courtyard stay",
        category: "Accommodation",
        sourceContext: "stay-catalog.example / listing B-204",
        note: "Central location; compare street noise and cancellation terms.",
        decisionState: "Considering",
      },
      {
        title: "Airport transfer options",
        category: "Transport",
        sourceContext: "transit-notes.example / airport connections",
        note: "Compare train frequency with the late-arrival bus schedule.",
        decisionState: "Considering",
      },
    ],
  },
  {
    status: "Shortlisted",
    explanation: "Strong candidates ready for a final decision.",
    cards: [
      {
        title: "Modernist neighborhood walk",
        category: "Activity",
        sourceContext: "walks-archive.example / route 07",
        note: "Fits the architecture focus and leaves the evening flexible.",
        decisionState: "Shortlisted",
      },
    ],
  },
  {
    status: "Booked",
    explanation: "Selected options treated as confirmed in this sample.",
    cards: [
      {
        title: "Morning arrival flight",
        category: "Flight",
        sourceContext: "flight-board.example / BCN morning option",
        note: "Fictional booking selected for its useful arrival time.",
        decisionState: "Booked",
      },
    ],
  },
  {
    status: "Rejected",
    explanation: "Reviewed options that will not move into the itinerary.",
    cards: [],
  },
];

export default async function TripWorkspacePage({
  params,
}: PageProps<"/trips/[tripId]">) {
  const { tripId } = await params;
  const encodedTripId = encodeURIComponent(tripId);

  return (
    <div className="space-y-8">
      <section className="max-w-reading space-y-3">
        <h2 className="text-heading font-semibold tracking-[-0.025em] text-ink">
          Visual Research Workspace
        </h2>
        <p className="text-body text-muted">
          Organize source-backed travel options here before itinerary decisions
          are finalized. Every Barcelona item below is fictional placeholder
          content and is not persisted.
        </p>
      </section>

      <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-5">
        {workspaceColumns.map((column) => (
          <StatusColumn key={column.status} {...column} />
        ))}
      </div>

      <section
        className="rounded-panel border border-border bg-surface-elevated p-6 shadow-card"
        aria-labelledby="workspace-next-views"
      >
        <h3
          id="workspace-next-views"
          className="text-body font-semibold text-ink"
        >
          Continue through the trip
        </h3>
        <p className="mt-2 max-w-reading text-small text-muted">
          Review source context in a structured list, or see how selected
          decisions could move into a curated itinerary.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-control bg-brand px-5 py-3 text-label font-semibold text-brand-contrast transition-colors hover:bg-brand-strong"
            href={`/trips/${encodedTripId}/links`}
          >
            View Links and Sources
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-control border border-border-strong bg-surface px-5 py-3 text-label font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
            href={`/trips/${encodedTripId}/itinerary`}
          >
            View Trip Itinerary
          </Link>
        </div>
      </section>
    </div>
  );
}
