import {
  ResearchCard,
  type DecisionState,
  type ResearchCardData,
} from "@/components/research-card";

type StatusColumnProps = {
  status: DecisionState;
  explanation: string;
  cards: ResearchCardData[];
};

const stateAccents: Record<DecisionState, string> = {
  Inbox: "bg-inbox",
  Considering: "bg-considering",
  Shortlisted: "bg-shortlisted",
  Booked: "bg-booked",
  Rejected: "bg-rejected",
};

export function StatusColumn({
  status,
  explanation,
  cards,
}: StatusColumnProps) {
  const headingId = `status-${status.toLowerCase()}`;

  return (
    <section
      className="min-w-0 rounded-panel border border-border bg-surface/70 p-4"
      aria-labelledby={headingId}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-pill ${stateAccents[status]}`}
          aria-hidden="true"
        />
        <div>
          <h3 id={headingId} className="text-body font-semibold text-ink">
            {status}
          </h3>
          <p className="mt-1 text-small text-muted">{explanation}</p>
        </div>
      </div>

      <p className="mt-4 border-y border-border py-2 text-small font-semibold text-muted">
        {cards.length} {cards.length === 1 ? "research card" : "research cards"}
      </p>

      {cards.length > 0 ? (
        <ul className="mt-4 space-y-4">
          {cards.map((card) => (
            <li key={`${status}-${card.title}`}>
              <ResearchCard {...card} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-card border border-dashed border-border-strong bg-surface p-4 text-small text-muted">
          No sample sources are in the {status.toLowerCase()} state yet.
        </p>
      )}
    </section>
  );
}
