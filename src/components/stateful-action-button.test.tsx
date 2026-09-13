import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatefulActionButton } from "@/components/stateful-action-button";

type DeferredAction = {
  promise: Promise<void>;
  resolve: () => void;
  reject: () => void;
};

function createDeferredAction(): DeferredAction {
  let resolve!: () => void;
  let reject!: () => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = () => rejectPromise(new Error("Deterministic action failure"));
  });

  return { promise, resolve, reject };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("StatefulActionButton", () => {
  it("moves from idle through one in-flight action to success and back", async () => {
    const user = userEvent.setup();
    const deferred = createDeferredAction();
    const onAction = vi.fn(() => deferred.promise);

    render(
      <StatefulActionButton
        onAction={onAction}
        idleLabel="Save choice"
        loadingLabel="Saving choice"
        successLabel="Choice saved"
      />,
    );

    const idleButton = screen.getByRole("button", { name: "Save choice" });
    expect(idleButton).toHaveAttribute("aria-busy", "false");

    await user.click(idleButton);

    const loadingButton = screen.getByRole("button", { name: "Saving choice" });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute("aria-busy", "true");
    await user.click(loadingButton);
    expect(onAction).toHaveBeenCalledTimes(1);

    vi.useFakeTimers();

    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });

    expect(
      screen.getByRole("button", { name: "Choice saved" }),
    ).toHaveAttribute("aria-busy", "false");

    act(() => {
      vi.advanceTimersByTime(1_200);
    });

    expect(
      screen.getByRole("button", { name: "Save choice" }),
    ).toBeEnabled();
  });

  it("shows an error after rejection and then returns to idle", async () => {
    const user = userEvent.setup();
    const deferred = createDeferredAction();

    render(
      <StatefulActionButton
        onAction={() => deferred.promise}
        idleLabel="Save choice"
        loadingLabel="Saving choice"
        errorLabel="Try saving again"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save choice" }));

    vi.useFakeTimers();

    await act(async () => {
      deferred.reject();
      await Promise.resolve();
    });

    expect(
      screen.getByRole("button", { name: "Try saving again" }),
    ).toBeEnabled();

    act(() => {
      vi.advanceTimersByTime(1_500);
    });

    expect(
      screen.getByRole("button", { name: "Save choice" }),
    ).toBeEnabled();
  });

  it("does not run the action while disabled", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn(async () => undefined);

    render(
      <StatefulActionButton
        onAction={onAction}
        disabled
        disabledLabel="Saving unavailable"
      />,
    );

    const button = screen.getByRole("button", {
      name: "Saving unavailable",
    });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "false");

    await user.click(button);

    expect(onAction).not.toHaveBeenCalled();
  });
});
