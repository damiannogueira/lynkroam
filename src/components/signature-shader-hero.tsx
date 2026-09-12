"use client";

import { useEffect, useRef } from "react";
import {
  LYNKROAM_HERO_FRAGMENT_SHADER,
  LYNKROAM_HERO_VERTEX_SHADER,
} from "@/lib/shaders/lynkroam-hero";

const MAX_DEVICE_PIXEL_RATIO = 1.5;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);

  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export function SignatureShaderHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement) {
      return;
    }

    const canvas: HTMLCanvasElement = canvasElement;

    const webGLContext = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });

    if (!webGLContext) {
      return;
    }

    const gl: WebGLRenderingContext = webGLContext;

    const vertexShader = compileShader(
      gl,
      gl.VERTEX_SHADER,
      LYNKROAM_HERO_VERTEX_SHADER,
    );
    const fragmentShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      LYNKROAM_HERO_FRAGMENT_SHADER,
    );

    if (!vertexShader || !fragmentShader) {
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
      return;
    }

    const program = gl.createProgram();
    const positionBuffer = gl.createBuffer();

    if (!program || !positionBuffer) {
      if (program) gl.deleteProgram(program);
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const mouseLocation = gl.getUniformLocation(program, "u_mouse");

    if (positionLocation < 0) {
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const pointerPosition = { x: 0.5, y: 0.5 };
    let animationFrame: number | null = null;
    let elapsedSeconds = 0;
    let lastTimestamp: number | null = null;
    let contextLost = false;

    function resizeCanvas() {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
      const width = Math.max(1, Math.round(bounds.width * dpr));
      const height = Math.max(1, Math.round(bounds.height * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    }

    function drawFrame() {
      if (contextLost) {
        return;
      }

      resizeCanvas();
      if (timeLocation) gl.uniform1f(timeLocation, elapsedSeconds);
      if (resolutionLocation) {
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      }
      if (mouseLocation) {
        gl.uniform2f(
          mouseLocation,
          pointerPosition.x * canvas.width,
          (1 - pointerPosition.y) * canvas.height,
        );
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function stopAnimation() {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      lastTimestamp = null;
    }

    function shouldAnimate() {
      return (
        !contextLost &&
        !reducedMotionQuery.matches &&
        document.visibilityState !== "hidden"
      );
    }

    function scheduleAnimation() {
      if (animationFrame === null && shouldAnimate()) {
        animationFrame = window.requestAnimationFrame(renderAnimationFrame);
      }
    }

    function renderAnimationFrame(timestamp: number) {
      animationFrame = null;

      if (!shouldAnimate()) {
        lastTimestamp = null;
        return;
      }

      if (lastTimestamp !== null) {
        elapsedSeconds += Math.max(0, timestamp - lastTimestamp) / 1000;
      }
      lastTimestamp = timestamp;
      drawFrame();
      scheduleAnimation();
    }

    function handlePointerMove(event: PointerEvent) {
      const bounds = canvas.getBoundingClientRect();

      if (bounds.width <= 0 || bounds.height <= 0) {
        return;
      }

      pointerPosition.x = Math.min(
        1,
        Math.max(0, (event.clientX - bounds.left) / bounds.width),
      );
      pointerPosition.y = Math.min(
        1,
        Math.max(0, (event.clientY - bounds.top) / bounds.height),
      );
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        stopAnimation();
      } else {
        scheduleAnimation();
      }
    }

    function handleReducedMotionChange() {
      if (reducedMotionQuery.matches) {
        stopAnimation();
        drawFrame();
      } else {
        scheduleAnimation();
      }
    }

    function handleContextLost(event: Event) {
      event.preventDefault();
      contextLost = true;
      stopAnimation();
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", drawFrame);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
    canvas.addEventListener("webglcontextlost", handleContextLost);

    drawFrame();
    scheduleAnimation();

    return () => {
      stopAnimation();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", drawFrame);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotionQuery.removeEventListener(
        "change",
        handleReducedMotionChange,
      );
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-brand-strong"
      style={{
        background:
          "radial-gradient(circle at 72% 32%, rgb(201 111 82 / 0.72), transparent 34%), linear-gradient(135deg, #0b5f59 0%, #0f766e 42%, #f6f2ea 115%)",
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none h-full w-full opacity-90"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
