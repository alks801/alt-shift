import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GoalBanner } from "@/components/letters/GoalBanner";
import { GOAL_LETTERS } from "@/lib/constants";

/**
 * Filled bars are marked with `data-filled="true"`. Counting them is more
 * faithful to the visual progress than re-checking the aria-label.
 */
function filledBarsCount(progress: HTMLElement) {
  return progress.querySelectorAll('[data-filled="true"]').length;
}

describe("<GoalBanner>", () => {
  it('shows the "today" subtitle on the dashboard variant', () => {
    render(<GoalBanner count={0} variant="today" />);

    expect(
      screen.getByText(/Generate and send out couple more job applications today/),
    ).toBeInTheDocument();
  });

  it('shows the "general" subtitle on the form variant (no "today" word)', () => {
    render(<GoalBanner count={0} variant="general" />);

    const subtitle = screen.getByText(/Generate and send out couple more job applications/);
    expect(subtitle).toBeInTheDocument();
    expect(subtitle).not.toHaveTextContent("today");
  });

  it("shows the textual progress label X out of GOAL", () => {
    render(<GoalBanner count={2} variant="today" />);

    expect(screen.getByText(`2 out of ${GOAL_LETTERS}`)).toBeInTheDocument();
  });

  it("fills the progress bar in step with the count", () => {
    render(<GoalBanner count={3} variant="today" />);

    const progress = screen.getByRole("img", {
      name: `3 of ${GOAL_LETTERS} applications generated`,
    });
    expect(filledBarsCount(progress)).toBe(3);
  });

  it("caps progress at GOAL when count exceeds it (never goes past 5)", () => {
    render(<GoalBanner count={42} variant="today" />);

    expect(screen.getByText(`${GOAL_LETTERS} out of ${GOAL_LETTERS}`)).toBeInTheDocument();
    const progress = screen.getByRole("img", {
      name: `${GOAL_LETTERS} of ${GOAL_LETTERS} applications generated`,
    });
    expect(filledBarsCount(progress)).toBe(GOAL_LETTERS);
  });
});
