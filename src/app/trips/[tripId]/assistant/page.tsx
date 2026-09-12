import { ResearchAssistantChat } from "@/components/research-assistant-chat";

export default async function TripAssistantPage({
  params,
}: PageProps<"/trips/[tripId]/assistant">) {
  await params;

  return (
    <div className="space-y-8">
      <section className="max-w-reading space-y-3">
        <h2 className="text-heading font-semibold tracking-[-0.025em] text-ink">
          Research Assistant
        </h2>
        <p className="text-body text-muted">
          Use the research you have gathered to compare options, uncover
          missing information, and reason through travel decisions. When you
          ask, it can inspect page-level metadata from a public webpage, but it
          does not verify changing details such as prices or availability.
        </p>
      </section>

      <ResearchAssistantChat />
    </div>
  );
}
