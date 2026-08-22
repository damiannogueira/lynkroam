"use client";

import { useEffect, useRef, useState } from "react";

const SUCCESS_HOLD_MS = 1_200;
const ERROR_HOLD_MS = 1_500;

export type ActionLifecycle = "idle" | "loading" | "success" | "error";

type VisualState = ActionLifecycle | "disabled";

export type StatefulActionButtonProps = {
  onAction: () => Promise<void>;
  idleLabel?: string;
  loadingLabel?: string;
  successLabel?: string;
  errorLabel?: string;
  disabledLabel?: string;
  disabled?: boolean;
  className?: string;
};

const stateClasses: Record<VisualState, string> = {
  idle:
    "border-brand bg-brand text-brand-contrast shadow-card hover:-translate-y-0.5 hover:bg-brand-strong hover:shadow-elevated focus-visible:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
  loading:
    "cursor-wait border-brand-strong bg-brand-strong text-brand-contrast shadow-elevated",
  success:
    "border-positive bg-positive text-brand-contrast shadow-elevated hover:-translate-y-0.5 focus-visible:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
  error:
    "border-warning bg-warning/10 text-ink shadow-card hover:-translate-y-0.5 focus-visible:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
  disabled:
    "cursor-not-allowed border-muted bg-muted text-surface opacity-75 shadow-none",
};

export function StatefulActionButton({
  onAction,
  idleLabel = "Continue",
  loadingLabel = "Working...",
  successLabel = "Complete",
  errorLabel = "Try again",
  disabledLabel = "Unavailable",
  disabled = false,
  className,
}: StatefulActionButtonProps) {
  const [lifecycle, setLifecycle] = useState<ActionLifecycle>("idle");
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);
  const operationIdRef = useRef(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visualState: VisualState =
    disabled && lifecycle === "idle" ? "disabled" : lifecycle;
  const isLoading = lifecycle === "loading";
  const isDisabled = disabled || isLoading;
  const labels: Record<VisualState, string> = {
    idle: idleLabel,
    loading: loadingLabel,
    success: successLabel,
    error: errorLabel,
    disabled: disabledLabel,
  };

  function clearResetTimer() {
    if (resetTimerRef.current !== null) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }

  function scheduleIdleReset(operationId: number, delay: number) {
    resetTimerRef.current = setTimeout(() => {
      resetTimerRef.current = null;

      if (
        mountedRef.current &&
        operationIdRef.current === operationId &&
        !inFlightRef.current
      ) {
        setLifecycle("idle");
      }
    }, delay);
  }

  async function runAction(operationId: number) {
    try {
      await onAction();

      if (!mountedRef.current || operationIdRef.current !== operationId) {
        return;
      }

      inFlightRef.current = false;
      setLifecycle("success");
      scheduleIdleReset(operationId, SUCCESS_HOLD_MS);
    } catch {
      if (!mountedRef.current || operationIdRef.current !== operationId) {
        return;
      }

      inFlightRef.current = false;
      setLifecycle("error");
      scheduleIdleReset(operationId, ERROR_HOLD_MS);
    }
  }

  function handleActivation() {
    if (disabled || inFlightRef.current) {
      return;
    }

    clearResetTimer();
    inFlightRef.current = true;
    const operationId = operationIdRef.current + 1;
    operationIdRef.current = operationId;
    setLifecycle("loading");
    void runAction(operationId);
  }

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      inFlightRef.current = false;
      operationIdRef.current += 1;
      clearResetTimer();
    };
  }, []);

  return (
    <button
      className={`relative inline-grid min-h-11 max-w-full min-w-40 items-center justify-items-center overflow-hidden rounded-control border px-5 py-3 text-label font-semibold transition-[transform,opacity,background-color,border-color,color,box-shadow] duration-200 ease-out hover:duration-150 focus-visible:duration-150 active:duration-100 motion-reduce:transform-none motion-reduce:transition-none ${stateClasses[visualState]} ${className ?? ""}`}
      type="button"
      onClick={handleActivation}
      disabled={isDisabled}
      aria-busy={isLoading}
    >
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {labels[visualState]}
      </span>
      <span
        className="col-start-1 row-start-1 inline-flex items-center gap-2"
        aria-hidden="true"
      >
        <span
          className={`transition-[opacity,transform] duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
            visualState === "idle"
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-1 scale-95 opacity-0"
          }`}
        >
          {idleLabel}
        </span>
      </span>
      <span
        className={`col-start-1 row-start-1 inline-flex items-center gap-2 transition-[opacity,transform] duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
          visualState === "loading"
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-1 scale-95 opacity-0"
        }`}
        aria-hidden="true"
      >
        <span className="h-4 w-4 animate-spin rounded-pill border-2 border-brand-contrast/40 border-t-brand-contrast motion-reduce:animate-none" />
        {loadingLabel}
      </span>
      <span
        className={`col-start-1 row-start-1 inline-flex items-center gap-2 transition-[opacity,transform] duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
          visualState === "success"
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-1 scale-95 opacity-0"
        }`}
        aria-hidden="true"
      >
        <span aria-hidden="true">✓</span>
        {successLabel}
      </span>
      <span
        className={`col-start-1 row-start-1 inline-flex items-center gap-2 transition-[opacity,transform] duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
          visualState === "error"
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-1 scale-95 opacity-0"
        }`}
        aria-hidden="true"
      >
        <span aria-hidden="true">!</span>
        {errorLabel}
      </span>
      <span
        className={`col-start-1 row-start-1 inline-flex items-center gap-2 transition-[opacity,transform] duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
          visualState === "disabled"
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-1 scale-95 opacity-0"
        }`}
        aria-hidden="true"
      >
        {disabledLabel}
      </span>
    </button>
  );
}
