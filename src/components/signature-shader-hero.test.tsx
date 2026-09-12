import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignatureShaderHero } from "@/components/signature-shader-hero";

type MediaChangeListener = (event: MediaQueryListEvent) => void;

const originalDevicePixelRatio = Object.getOwnPropertyDescriptor(
  window,
  "devicePixelRatio",
);
const originalGetBoundingClientRect =
  HTMLCanvasElement.prototype.getBoundingClientRect;
const originalGetContext = HTMLCanvasElement.prototype.getContext;
const originalRequestAnimationFrame = window.requestAnimationFrame;
const originalCancelAnimationFrame = window.cancelAnimationFrame;
const originalMatchMedia = window.matchMedia;
const originalVisibilityState = Object.getOwnPropertyDescriptor(
  document,
  "visibilityState",
);

let reducedMotion = false;
let webGLAvailable = true;
let visibilityState: DocumentVisibilityState = "visible";
let nextAnimationFrame = 1;
const animationFrames = new Map<number, FrameRequestCallback>();
const mediaChangeListeners = new Set<MediaChangeListener>();

const uniformLocations = {
  u_mouse: { name: "u_mouse" },
  u_resolution: { name: "u_resolution" },
  u_time: { name: "u_time" },
};

function createWebGLMock() {
  return {
    ARRAY_BUFFER: 0x8892,
    COMPILE_STATUS: 0x8b81,
    FLOAT: 0x1406,
    FRAGMENT_SHADER: 0x8b30,
    LINK_STATUS: 0x8b82,
    STATIC_DRAW: 0x88e4,
    TRIANGLES: 0x0004,
    VERTEX_SHADER: 0x8b31,
    attachShader: vi.fn(),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    compileShader: vi.fn(),
    createBuffer: vi.fn(() => ({ kind: "buffer" })),
    createProgram: vi.fn(() => ({ kind: "program" })),
    createShader: vi.fn(() => ({ kind: "shader" })),
    deleteBuffer: vi.fn(),
    deleteProgram: vi.fn(),
    deleteShader: vi.fn(),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getProgramParameter: vi.fn(() => true),
    getShaderParameter: vi.fn(() => true),
    getUniformLocation: vi.fn(
      (_program: unknown, name: keyof typeof uniformLocations) =>
        uniformLocations[name],
    ),
    linkProgram: vi.fn(),
    shaderSource: vi.fn(),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
    viewport: vi.fn(),
  };
}

let gl = createWebGLMock();

function setVisibility(nextVisibility: DocumentVisibilityState) {
  visibilityState = nextVisibility;
  document.dispatchEvent(new Event("visibilitychange"));
}

function setReducedMotion(matches: boolean) {
  reducedMotion = matches;
  const event = { matches } as MediaQueryListEvent;
  mediaChangeListeners.forEach((listener) => listener(event));
}

function runNextAnimationFrame(timestamp: number) {
  const nextFrame = animationFrames.entries().next().value;

  if (!nextFrame) {
    throw new Error("No animation frame is pending.");
  }

  const [id, callback] = nextFrame;
  animationFrames.delete(id);
  callback(timestamp);
}

beforeEach(() => {
  reducedMotion = false;
  webGLAvailable = true;
  visibilityState = "visible";
  nextAnimationFrame = 1;
  animationFrames.clear();
  mediaChangeListeners.clear();
  gl = createWebGLMock();

  Object.defineProperty(window, "devicePixelRatio", {
    configurable: true,
    value: 3,
  });
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => visibilityState,
  });
  HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
    bottom: 200,
    height: 200,
    left: 0,
    right: 400,
    top: 0,
    width: 400,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  }));
  HTMLCanvasElement.prototype.getContext = vi.fn(
    (contextId: string) =>
      contextId === "webgl" && webGLAvailable
        ? (gl as unknown as WebGLRenderingContext)
        : null,
  ) as typeof HTMLCanvasElement.prototype.getContext;
  window.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    const id = nextAnimationFrame;
    nextAnimationFrame += 1;
    animationFrames.set(id, callback);
    return id;
  });
  window.cancelAnimationFrame = vi.fn((id: number) => {
    animationFrames.delete(id);
  });
  window.matchMedia = vi.fn(
    (query: string) =>
      ({
        media: query,
        get matches() {
          return reducedMotion;
        },
        addEventListener: (
          event: string,
          listener: MediaChangeListener,
        ) => {
          if (event === "change") mediaChangeListeners.add(listener);
        },
        removeEventListener: (
          event: string,
          listener: MediaChangeListener,
        ) => {
          if (event === "change") mediaChangeListeners.delete(listener);
        },
      }) as MediaQueryList,
  );
});

afterEach(() => {
  if (originalDevicePixelRatio) {
    Object.defineProperty(
      window,
      "devicePixelRatio",
      originalDevicePixelRatio,
    );
  }
  if (originalVisibilityState) {
    Object.defineProperty(
      document,
      "visibilityState",
      originalVisibilityState,
    );
  }
  HTMLCanvasElement.prototype.getBoundingClientRect =
    originalGetBoundingClientRect;
  HTMLCanvasElement.prototype.getContext = originalGetContext;
  window.requestAnimationFrame = originalRequestAnimationFrame;
  window.cancelAnimationFrame = originalCancelAnimationFrame;
  window.matchMedia = originalMatchMedia;
});

describe("SignatureShaderHero", () => {
  it("always renders the CSS gradient fallback", () => {
    const { container } = render(<SignatureShaderHero />);

    expect(container.firstElementChild).toHaveStyle({
      background:
        "radial-gradient(circle at 72% 32%, rgb(201 111 82 / 0.72), transparent 34%), linear-gradient(135deg, #0b5f59 0%, #0f766e 42%, #f6f2ea 115%)",
    });
  });

  it("keeps the canvas decorative and outside keyboard focus", () => {
    const { container } = render(<SignatureShaderHero />);
    const canvas = container.querySelector("canvas");

    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).toHaveAttribute("tabindex", "-1");
  });

  it("caps the backing resolution DPR at 1.5", () => {
    const { container } = render(<SignatureShaderHero />);
    const canvas = container.querySelector("canvas");

    expect(canvas).toHaveProperty("width", 600);
    expect(canvas).toHaveProperty("height", 300);
    expect(gl.viewport).toHaveBeenCalledWith(0, 0, 600, 300);
  });

  it("seeds the mouse uniform at the backing canvas center", () => {
    render(<SignatureShaderHero />);

    expect(gl.uniform2f).toHaveBeenCalledWith(
      uniformLocations.u_mouse,
      300,
      150,
    );
  });

  it("runs one animation loop when motion is allowed and the tab is visible", () => {
    render(<SignatureShaderHero />);

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(animationFrames).toHaveLength(1);

    act(() => runNextAnimationFrame(100));

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
    expect(animationFrames).toHaveLength(1);
  });

  it("pauses while hidden and resumes without creating duplicate loops", () => {
    render(<SignatureShaderHero />);

    act(() => setVisibility("hidden"));
    expect(window.cancelAnimationFrame).toHaveBeenCalledTimes(1);
    expect(animationFrames).toHaveLength(0);

    act(() => setVisibility("visible"));
    act(() => setVisibility("visible"));
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
    expect(animationFrames).toHaveLength(1);
  });

  it("uses a static frame for reduced motion and responds to preference changes", () => {
    reducedMotion = true;
    render(<SignatureShaderHero />);

    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();

    act(() => setReducedMotion(false));
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);

    act(() => setReducedMotion(true));
    expect(window.cancelAnimationFrame).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });

  it("keeps the CSS fallback when WebGL is unavailable", () => {
    webGLAvailable = false;

    const { container } = render(<SignatureShaderHero />);

    expect(container.firstElementChild).toHaveClass("bg-brand-strong");
    expect(container.querySelector("canvas")).toBeInTheDocument();
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("stops on context loss and releases listeners and resources on cleanup", () => {
    const windowRemoveListener = vi.spyOn(window, "removeEventListener");
    const documentRemoveListener = vi.spyOn(document, "removeEventListener");
    const { container, unmount } = render(<SignatureShaderHero />);
    const canvas = container.querySelector("canvas");

    expect(canvas).not.toBeNull();
    if (!canvas) {
      throw new Error("Shader canvas was not rendered.");
    }
    const canvasRemoveListener = vi.spyOn(canvas, "removeEventListener");
    const contextLoss = new Event("webglcontextlost", { cancelable: true });
    act(() => canvas?.dispatchEvent(contextLoss));

    expect(contextLoss.defaultPrevented).toBe(true);
    expect(window.cancelAnimationFrame).toHaveBeenCalledTimes(1);

    unmount();

    expect(windowRemoveListener).toHaveBeenCalledWith(
      "pointermove",
      expect.any(Function),
    );
    expect(windowRemoveListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
    expect(documentRemoveListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
    expect(canvasRemoveListener).toHaveBeenCalledWith(
      "webglcontextlost",
      expect.any(Function),
    );
    expect(mediaChangeListeners).toHaveLength(0);
    expect(gl.deleteBuffer).toHaveBeenCalledTimes(1);
    expect(gl.deleteProgram).toHaveBeenCalledTimes(1);
  });
});
