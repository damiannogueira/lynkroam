"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";

const destinations = [
  {
    id: "barcelona",
    name: "Barcelona",
    descriptor: "Architecture and neighborhood rhythm",
    description:
      "Balance landmark architecture with walkable districts, local food, and time to explore without a rigid schedule.",
    researchContext:
      "Compare neighborhood bases, group architecture stops by area, and keep flexible meal options nearby.",
    initials: "BCN",
    sceneClass: "bg-brand-soft",
    markerClass: "bg-accent-strong text-surface",
    horizonClass: "bg-brand",
  },
  {
    id: "lisbon",
    name: "Lisbon",
    descriptor: "Hills, viewpoints, and local connections",
    description:
      "Shape a city break around distinct neighborhoods, scenic climbs, and practical routes between waterfront and hilltop stops.",
    researchContext:
      "Compare transit access with walking effort, then shortlist viewpoints and food areas that fit the same route.",
    initials: "LIS",
    sceneClass: "bg-warning/10",
    markerClass: "bg-warning text-surface",
    horizonClass: "bg-accent",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    descriptor: "District scale and contrasting pace",
    description:
      "Organize a large city through focused districts, balancing high-energy areas with quieter cultural and food discoveries.",
    researchContext:
      "Group decisions by rail corridor, compare district priorities, and leave space for discoveries between planned anchors.",
    initials: "TYO",
    sceneClass: "bg-inbox/10",
    markerClass: "bg-ink text-surface",
    horizonClass: "bg-inbox",
  },
] as const;

type Destination = (typeof destinations)[number];
type RenderMode =
  | "checking"
  | "ready"
  | "interactive"
  | "reduced-motion"
  | "save-data"
  | "no-webgl";

type NavigatorWithConnection = Navigator & {
  readonly connection?: {
    readonly saveData?: boolean;
  };
};

function supportsWebGL() {
  const canvas = document.createElement("canvas");

  try {
    const context =
      canvas.getContext("webgl2") ?? canvas.getContext("webgl");

    if (!context) {
      return false;
    }

    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

function StaticDestinationPreview({
  action,
  destination,
  label = "Static destination preview",
}: {
  action?: ReactNode;
  destination: Destination;
  label?: string;
}) {
  return (
    <figure
      className={`relative aspect-[4/3] w-full min-w-0 overflow-hidden rounded-panel border border-border p-5 shadow-card sm:p-8 ${destination.sceneClass}`}
      aria-labelledby="destination-preview-name"
      aria-describedby="destination-preview-caption"
    >
      <div
        className="absolute -right-12 -top-12 h-48 w-48 rounded-pill border border-surface/70 bg-surface/40"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[18%] left-[8%] h-[28%] w-[84%] rounded-pill border border-surface/70 bg-surface/55 shadow-elevated"
        aria-hidden="true"
      />
      <div
        className={`absolute bottom-[23%] left-[14%] h-[9%] w-[72%] rounded-pill opacity-80 ${destination.horizonClass}`}
        aria-hidden="true"
      />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <span className="w-fit rounded-pill border border-border bg-surface/90 px-3 py-1 text-small font-semibold text-muted">
            {label}
          </span>
          {action}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="max-w-reading rounded-card border border-border bg-surface/90 p-4 shadow-elevated sm:p-5">
            <p className="text-small font-semibold uppercase tracking-[0.12em] text-brand">
              Selected destination
            </p>
            <p
              id="destination-preview-name"
              className="mt-2 text-heading font-semibold tracking-[-0.025em] text-ink"
            >
              {destination.name}
            </p>
            <figcaption
              id="destination-preview-caption"
              className="mt-2 text-small text-muted"
            >
              {destination.descriptor}
            </figcaption>
          </div>

          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-pill border-4 border-surface text-label font-semibold shadow-card sm:h-20 sm:w-20 ${destination.markerClass}`}
            aria-hidden="true"
          >
            {destination.initials}
          </div>
        </div>
      </div>
    </figure>
  );
}

const TripExplorerScene = dynamic(
  () =>
    import("@/components/trip-explorer-scene").then(
      (module) => module.TripExplorerScene,
    ),
  {
    ssr: false,
    loading: () => (
      <p
        className="absolute right-5 top-5 rounded-pill border border-border bg-surface/95 px-4 py-2 text-small font-semibold text-muted shadow-elevated"
        role="status"
      >
        Loading 3D view…
      </p>
    ),
  },
);

const fallbackLabels: Record<Exclude<RenderMode, "interactive">, string> = {
  checking: "Static destination preview",
  ready: "Static destination preview",
  "reduced-motion": "Static preview — reduced motion",
  "save-data": "Static preview — data saver",
  "no-webgl": "Static preview — 3D unavailable",
};

export function TripExplorer() {
  const [selectedDestination, setSelectedDestination] = useState<Destination>(
    destinations[0],
  );
  const [renderMode, setRenderMode] = useState<RenderMode>("checking");
  const [threeDRequested, setThreeDRequested] = useState(false);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const saveData = (navigator as NavigatorWithConnection).connection
      ?.saveData;
    let webGLAvailable: boolean | undefined;

    function resolveRenderMode() {
      if (reducedMotionQuery.matches) {
        setRenderMode("reduced-motion");
        return;
      }

      if (saveData === true) {
        setRenderMode("save-data");
        return;
      }

      if (!threeDRequested) {
        setRenderMode("ready");
        return;
      }

      webGLAvailable ??= supportsWebGL();
      setRenderMode(webGLAvailable ? "interactive" : "no-webgl");
    }

    resolveRenderMode();
    reducedMotionQuery.addEventListener("change", resolveRenderMode);

    return () => {
      reducedMotionQuery.removeEventListener("change", resolveRenderMode);
    };
  }, [threeDRequested]);

  function handleLaunchThreeD() {
    setRenderMode("checking");
    setThreeDRequested(true);
  }

  return (
    <section className="space-y-6" aria-labelledby="trip-explorer-heading">
      <div className="max-w-reading space-y-3">
        <h2
          id="trip-explorer-heading"
          className="text-heading font-semibold tracking-[-0.025em] text-ink"
        >
          Choose a destination
        </h2>
        <p className="text-body text-muted">
          Explore how each city changes the visual direction and the travel
          questions worth resolving before an itinerary takes shape.
        </p>
      </div>

      <fieldset className="flex flex-wrap gap-3">
        <legend className="sr-only">Trip Explorer destinations</legend>
        {destinations.map((destination) => {
          const isSelected = destination.id === selectedDestination.id;

          return (
            <button
              className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-control border px-4 py-3 text-label font-semibold transition-colors sm:flex-none ${
                isSelected
                  ? "border-brand bg-brand-soft text-brand shadow-elevated"
                  : "border-border-strong bg-surface text-ink hover:border-brand hover:text-brand"
              }`}
              key={destination.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedDestination(destination)}
            >
              {destination.name}
              {isSelected ? (
                <span className="text-small font-semibold">Selected</span>
              ) : null}
            </button>
          );
        })}
      </fieldset>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
        {renderMode === "interactive" ? (
          <div className="relative aspect-[4/3] w-full min-w-0 overflow-hidden rounded-panel border border-border bg-brand-soft shadow-card">
            <div className="absolute inset-0" aria-hidden="true">
              <StaticDestinationPreview
                destination={selectedDestination}
                label="Static destination preview"
              />
            </div>
            <div className="absolute inset-0">
              <TripExplorerScene destination={selectedDestination.id} />
            </div>
          </div>
        ) : (
          <StaticDestinationPreview
            action={
              renderMode === "ready" ? (
                <button
                  className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-control border border-brand bg-surface/95 px-4 py-2 text-label font-semibold text-brand shadow-elevated transition-colors hover:bg-brand-soft"
                  type="button"
                  onClick={handleLaunchThreeD}
                >
                  Launch 3D view
                </button>
              ) : null
            }
            destination={selectedDestination}
            label={fallbackLabels[renderMode]}
          />
        )}

        <article className="rounded-panel border border-border bg-surface-elevated p-6 shadow-card sm:p-8">
          <p className="text-label font-semibold uppercase tracking-[0.14em] text-accent-strong">
            Research direction
          </p>
          <h3 className="mt-3 text-heading font-semibold tracking-[-0.025em] text-ink">
            {selectedDestination.name}
          </h3>
          <p className="mt-3 text-body text-muted">
            {selectedDestination.description}
          </p>

          <div className="mt-6 border-t border-border pt-5">
            <p className="text-small font-semibold uppercase tracking-[0.12em] text-muted">
              Useful research context
            </p>
            <p className="mt-2 text-body text-ink">
              {selectedDestination.researchContext}
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
