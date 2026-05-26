import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LetterPreview } from "@/components/letters/LetterPreview";

describe("<LetterPreview>", () => {
  it("renders the placeholder in the idle state with the copy button disabled", () => {
    render(<LetterPreview status="idle" text="" />);

    expect(
      screen.getByText(/Your personalized job application will appear here/),
    ).toBeInTheDocument();
    // Copy is shown but inert — no text to copy yet.
    expect(screen.getByRole("button", { name: /Copy to clipboard/ })).toBeDisabled();
  });

  it("hides the copy footer while loading and while showing an error", () => {
    const { rerender } = render(<LetterPreview status="loading" text="" />);
    expect(screen.queryByRole("button", { name: /Copy to clipboard/ })).not.toBeInTheDocument();

    rerender(<LetterPreview status="error" text="" />);
    expect(screen.queryByRole("button", { name: /Copy to clipboard/ })).not.toBeInTheDocument();
  });

  it("renders the custom error message in an alert when status=error", () => {
    render(<LetterPreview status="error" text="" errorMessage="Network failed" />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Network failed");
    // No copy footer in the error state — nothing to copy yet.
    expect(screen.queryByRole("button", { name: /Copy to clipboard/ })).not.toBeInTheDocument();
  });

  it("falls back to a default error message when none is provided", () => {
    render(<LetterPreview status="error" text="" />);

    expect(screen.getByRole("alert")).toHaveTextContent(/Something went wrong/);
  });

  it("renders the generated body and the copy footer when status=ready", () => {
    render(<LetterPreview status="ready" text="Dear Apple Team," />);

    expect(screen.getByText("Dear Apple Team,")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Copy to clipboard/ })).toBeInTheDocument();
  });
});
