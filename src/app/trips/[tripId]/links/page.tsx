import Link from "next/link";
import {
  ResearchCard,
  type ResearchCardData,
} from "@/components/research-card";

const sourceGroups: { category: string; entries: ResearchCardData[] }[] = [
  {
    category: "Flights and transport",
    entries: [
      {
        title: "Morning arrival flight",
        category: "Flight",
        sourceContext: "flight-board.example / BCN morning option",
        note: "Fictional option retained because the arrival time preserves the first afternoon.",
        decisionState: "Booked",
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
    category: "Stay and activities",
    entries: [
      {
        title: "Eixample courtyard stay",
        category: "Accommodation",
        sourceContext: "stay-catalog.example / listing B-204",
        note: "Central location; compare street noise and cancellation terms.",
        decisionState: "Considering",
      },
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
    category: "Food and guides",
    entries: [
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
];

export default async function TripLinksPage({
  params,
}: PageProps<"/trips/[tripId]/links">) {
  const { tripId } = await params;
  const workspacePath = `/trips/${encodeURIComponent(tripId)}`;

  return (
    <div className="space-y-8">
      <section className="max-w-reading space-y-3">
        <h2 className="text-heading font-semibold tracking-[-0.025em] text-ink">
          Links and Sources
        </h2>
        <p className="text-body text-muted">
          Lynkroam preserves why a source mattered and how it influenced a
          decision, rather than reducing travel research to a generic bookmark
          list. These entries are fictional, non-persistent placeholders.
        </p>
      </section>

      <div className="space-y-8">
        {sourceGroups.map((group) => {
          const headingId = `source-group-${group.category
            .toLowerCase()
            .replace(/\s+/g, "-")}`;

          return (
            <section key={group.category} aria-labelledby={headingId}>
              <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-border pb-3">
                <h3
                  id={headingId}
                  className="text-body font-semibold text-ink"
                >
                  {group.category}
                </h3>
                <p className="text-small text-muted">
                  {group.entries.length} sources
                </p>
              </div>
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.entries.map((entry) => (
                  <li key={entry.title}>
                    <ResearchCard {...entry} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <Link
        className="inline-flex min-h-11 items-center rounded-control px-3 py-2 text-label font-semibold text-brand transition-colors hover:bg-brand-soft"
        href={workspacePath}
      >
        Back to Workspace
      </Link>
    </div>
  );
}
