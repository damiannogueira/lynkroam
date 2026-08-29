import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TripExplorer } from "@/components/trip-explorer";

type MockDestination = "barcelona" | "lisbon" | "tokyo";

vi.mock("@/components/trip-explorer-scene", () => ({
  TripExplorerScene: ({ destination }: { destination: MockDestination }) => (
    <div role="img" aria-label={`Interactive scene for ${destination}`}>
      Interactive scene: {destination}
    </div>
  ),
}));

const originalMatchMedia = Object.getOwnPropertyDescriptor(
  window,
  "matchMedia",
);
const originalGetContext = Object.getOwnPropertyDescriptor(
  HTMLCanvasElement.prototype,
  "getContext",
);
const originalConnection = Object.getOwnPropertyDescriptor(
  navigator,
  "connection",
);

let reducedMotion = false;
let webGLContextRequests = 0;
const reducedMotionListeners = new Set<() => void>();

function setReducedMotion(matches: boolean) {
  reducedMotion = matches;
  reducedMotionListeners.forEach((listener) => listener());
}

beforeEach(() => {
  reducedMotion = false;
  webGLContextRequests = 0;
  reducedMotionListeners.clear();

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      media: query,
      get matches() {
        return reducedMotion;
      },
      addEventListener: (event: string, listener: () => void) => {
        if (event === "change") {
          reducedMotionListeners.add(listener);
        }
      },
      removeEventListener: (event: string, listener: () => void) => {
        if (event === "change") {
          reducedMotionListeners.delete(listener);
        }
      },
    }),
  });

  Object.defineProperty(navigator, "connection", {
    configurable: true,
    value: undefined,
  });

  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value: (contextId: string) => {
      if (contextId === "webgl" || contextId === "webgl2") {
        webGLContextRequests += 1;
        return { getExtension: () => null };
      }

      return null;
    },
  });
});

afterEach(() => {
  if (originalMatchMedia) {
    Object.defineProperty(window, "matchMedia", originalMatchMedia);
  } else {
    Reflect.deleteProperty(window, "matchMedia");
  }

  if (originalConnection) {
    Object.defineProperty(navigator, "connection", originalConnection);
  } else {
    Reflect.deleteProperty(navigator, "connection");
  }

  if (originalGetContext) {
    Object.defineProperty(
      HTMLCanvasElement.prototype,
      "getContext",
      originalGetContext,
    );
  }
});

describe("TripExplorer", () => {
  it("updates the selected destination and interactive scene", async () => {
    const user = userEvent.setup();

    render(<TripExplorer />);

    expect(
      screen.getByRole("button", { name: /Barcelona/, pressed: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Compare neighborhood bases, group architecture stops by area, and keep flexible meal options nearby.",
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("img", {
        name: "Interactive scene for barcelona",
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Lisbon" }));

    expect(
      screen.getByRole("button", { name: /Lisbon/, pressed: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Barcelona", pressed: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Compare transit access with walking effort, then shortlist viewpoints and food areas that fit the same route.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Interactive scene for lisbon" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tokyo" }));

    expect(
      screen.getByRole("button", { name: /Tokyo/, pressed: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Group decisions by rail corridor, compare district priorities, and leave space for discoveries between planned anchors.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Interactive scene for tokyo" }),
    ).toBeInTheDocument();
  });

  it("keeps destination selection functional in reduced-motion mode", async () => {
    const user = userEvent.setup();
    reducedMotion = true;

    render(<TripExplorer />);

    expect(
      await screen.findByText("Static preview — reduced motion"),
    ).toBeInTheDocument();
    const barcelonaPreview = screen.getByRole("figure", {
      name: "Barcelona",
    });
    expect(
      within(barcelonaPreview).getByText(
        "Architecture and neighborhood rhythm",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(webGLContextRequests).toBe(0);

    await user.click(screen.getByRole("button", { name: "Lisbon" }));

    expect(
      screen.getByRole("button", { name: /Lisbon/, pressed: true }),
    ).toBeInTheDocument();
    const lisbonPreview = screen.getByRole("figure", { name: "Lisbon" });
    expect(
      within(lisbonPreview).getByText(
        "Hills, viewpoints, and local connections",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("responds to live reduced-motion preference changes", async () => {
    const user = userEvent.setup();

    render(<TripExplorer />);

    await user.click(screen.getByRole("button", { name: "Lisbon" }));
    expect(
      await screen.findByRole("img", {
        name: "Interactive scene for lisbon",
      }),
    ).toBeInTheDocument();

    act(() => {
      setReducedMotion(true);
    });

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      screen.getByText("Static preview — reduced motion"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Lisbon/, pressed: true }),
    ).toBeInTheDocument();
    expect(screen.getByRole("figure", { name: "Lisbon" })).toBeInTheDocument();

    act(() => {
      setReducedMotion(false);
    });

    expect(
      await screen.findByRole("img", {
        name: "Interactive scene for lisbon",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Lisbon/, pressed: true }),
    ).toBeInTheDocument();
  });
});
