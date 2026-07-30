import Link from "next/link";

const itinerarySections = [
  {
    category: "Flights",
    state: "Booked",
    stateClass: "border-booked/35 bg-booked/10 text-booked",
    context:
      "A fictional morning arrival option is treated as confirmed so the first afternoon remains open.",
  },
  {
    category: "Accommodation",
    state: "Still considering",
    stateClass: "border-considering/35 bg-considering/10 text-considering",
    context:
      "The Eixample stay remains under review while noise, price, and cancellation terms are compared.",
  },
  {
    category: "Activities",
    state: "Shortlisted",
    stateClass: "border-shortlisted/35 bg-shortlisted/10 text-shortlisted",
    context:
      "The modernist neighborhood walk is a strong candidate but has not been scheduled or booked.",
  },
  {
    category: "Food",
    state: "Unresolved",
    stateClass: "border-inbox/35 bg-inbox/10 text-inbox",
    context:
      "Neighborhood food notes still need to become a smaller set of flexible meal options.",
  },
  {
    category: "Transport",
    state: "Still considering",
    stateClass: "border-considering/35 bg-considering/10 text-considering",
    context:
      "Airport train and bus options remain open until arrival timing and accommodation are finalized.",
  },
];

export default async function TripItineraryPage({
  params,
}: PageProps<"/trips/[tripId]/itinerary">) {
  const { tripId } = await params;
  const workspacePath = `/trips/${encodeURIComponent(tripId)}`;

  return (
    <div className="space-y-8">
      <section className="max-w-reading space-y-3">
        <h2 className="text-heading font-semibold tracking-[-0.025em] text-ink">
          Trip Itinerary
        </h2>
        <p className="text-body text-muted">
          Itinerary items are the curated outcome of workspace research. These
          fictional placeholders distinguish the one sample booking from
          decisions that still need work; no schedule or trip data is persisted.
        </p>
      </section>

      <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {itinerarySections.map((item) => (
          <li key={item.category}>
            <section className="h-full rounded-card border border-border bg-surface-elevated p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-body font-semibold text-ink">
                  {item.category}
                </h3>
                <span
                  className={`rounded-pill border px-3 py-1 text-small font-semibold ${item.stateClass}`}
                >
                  {item.state}
                </span>
              </div>
              <p className="mt-4 text-body text-muted">{item.context}</p>
              <dl className="mt-5 border-t border-border pt-4 text-small">
                <dt className="font-semibold text-ink">Planning state</dt>
                <dd className="mt-1 text-muted">{item.state}</dd>
              </dl>
            </section>
          </li>
        ))}
      </ul>

      <Link
        className="inline-flex min-h-11 items-center rounded-control px-3 py-2 text-label font-semibold text-brand transition-colors hover:bg-brand-soft"
        href={workspacePath}
      >
        Back to Workspace
      </Link>
    </div>
  );
}
