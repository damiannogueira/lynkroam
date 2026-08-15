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
          missing information, and reason through travel decisions. Responses
          are based on the context shared in this conversation.
        </p>
      </section>

      <ResearchAssistantChat />
    </div>
  );
}
