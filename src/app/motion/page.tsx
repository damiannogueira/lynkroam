import { MotionActionDemo } from "@/components/motion-action-demo";
import { PageHeader } from "@/components/page-header";

export default function MotionPage() {
  return (
    <div className="mx-auto w-full max-w-page space-y-section px-page-gutter py-section">
      <PageHeader
        eyebrow="Interaction design study"
        title="Motion & state micro-interactions"
        description="The same reusable action button communicates idle, hover and focus, active, loading, success, and error states through intentional transitions."
      />

      <MotionActionDemo />
    </div>
  );
}
