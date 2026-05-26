import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LetterForm } from "@/components/letters/LetterForm";
import { DETAILS_MAX_LENGTH } from "@/lib/constants";
import type { LetterInput } from "@/lib/types";

const EMPTY: LetterInput = { jobTitle: "", company: "", strengths: "", details: "" };
const FILLED: LetterInput = {
  jobTitle: "Product manager",
  company: "Apple",
  strengths: "",
  details: "",
};

/**
 * `LetterForm` is fully controlled — the parent owns the state. Wrap it in
 * a tiny harness so the change-callback tests reflect a real consumer
 * (state updates, re-renders) instead of a one-shot `vi.fn()` assertion.
 */
function Harness({
  initial = EMPTY,
  status = "idle",
  onSubmit = () => {},
}: {
  initial?: LetterInput;
  status?: "idle" | "loading" | "ready" | "error";
  onSubmit?: () => void;
}) {
  const [values, setValues] = useState(initial);
  return <LetterForm values={values} onChange={setValues} onSubmit={onSubmit} status={status} />;
}

function getSubmitButton() {
  return (
    screen.queryByRole("button", { name: "Generate Now" }) ??
    screen.getByRole("button", { name: "Try Again" })
  );
}

describe("<LetterForm>", () => {
  describe("submit gating", () => {
    it("disables submit while required fields are empty", () => {
      render(<Harness initial={EMPTY} />);
      expect(getSubmitButton()).toBeDisabled();
    });

    it("disables submit when only one of job/company is filled", () => {
      render(<Harness initial={{ ...EMPTY, jobTitle: "PM" }} />);
      expect(getSubmitButton()).toBeDisabled();
    });

    it("treats whitespace-only required fields as empty", () => {
      render(<Harness initial={{ ...EMPTY, jobTitle: "   ", company: "   " }} />);
      expect(getSubmitButton()).toBeDisabled();
    });

    it("enables submit once both required fields are filled", () => {
      render(<Harness initial={FILLED} />);
      expect(getSubmitButton()).toBeEnabled();
    });

    it("disables submit when details exceed the soft limit", () => {
      render(<Harness initial={{ ...FILLED, details: "a".repeat(DETAILS_MAX_LENGTH + 1) }} />);
      expect(getSubmitButton()).toBeDisabled();
    });

    it("keeps submit enabled exactly at the soft limit", () => {
      render(<Harness initial={{ ...FILLED, details: "a".repeat(DETAILS_MAX_LENGTH) }} />);
      expect(getSubmitButton()).toBeEnabled();
    });
  });

  describe("submission", () => {
    it("calls onSubmit (and prevents page reload) when the form is submitted", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<Harness initial={FILLED} onSubmit={onSubmit} />);

      await user.click(screen.getByRole("button", { name: "Generate Now" }));

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("does not call onSubmit when required fields are missing (button disabled)", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<Harness initial={EMPTY} onSubmit={onSubmit} />);

      await user.click(screen.getByRole("button", { name: "Generate Now" }));

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("input → onChange", () => {
    it("propagates typed text back through the controlled value", async () => {
      const user = userEvent.setup();
      render(<Harness initial={EMPTY} />);

      await user.type(screen.getByRole("textbox", { name: "Job title" }), "Designer");
      await user.type(screen.getByRole("textbox", { name: "Company" }), "Linear");

      expect(screen.getByRole("textbox", { name: "Job title" })).toHaveValue("Designer");
      expect(screen.getByRole("textbox", { name: "Company" })).toHaveValue("Linear");
      // Filling both required fields should unblock submit (covers the
      // round-trip onChange → re-render → gating recompute).
      expect(screen.getByRole("button", { name: "Generate Now" })).toBeEnabled();
    });
  });

  describe("status modes", () => {
    it("loading: disables all fields, hides label, marks button as loading", () => {
      render(<Harness initial={FILLED} status="loading" />);

      expect(screen.getByRole("textbox", { name: "Job title" })).toBeDisabled();
      expect(screen.getByRole("textbox", { name: "Company" })).toBeDisabled();
      expect(screen.getByRole("textbox", { name: /I am good at/ })).toBeDisabled();
      expect(screen.getByRole("textbox", { name: "Additional details" })).toBeDisabled();

      // Label is blanked while the spinner is up; the button is in data-loading
      // mode and disabled regardless of the canSubmit value.
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("data-loading", "true");
      expect(button).toHaveTextContent("");
    });

    it("ready: swaps the CTA to secondary 'Try Again'", () => {
      render(<Harness initial={FILLED} status="ready" />);

      expect(screen.queryByRole("button", { name: "Generate Now" })).not.toBeInTheDocument();
      const retry = screen.getByRole("button", { name: "Try Again" });
      // Non-scoped CSS module strategy preserves the original class name.
      expect(retry).toHaveClass("secondary");
      expect(retry).toBeEnabled();
    });

    it("idle and error use the same primary 'Generate Now' CTA", () => {
      const { rerender } = render(<Harness initial={FILLED} status="idle" />);
      expect(screen.getByRole("button", { name: "Generate Now" })).toBeInTheDocument();

      rerender(<Harness initial={FILLED} status="error" />);
      expect(screen.getByRole("button", { name: "Generate Now" })).toBeInTheDocument();
    });
  });
});
