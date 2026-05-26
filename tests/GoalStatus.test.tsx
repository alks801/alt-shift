import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GoalStatus } from "@/components/letters/GoalStatus";
import { GOAL_LETTERS } from "@/lib/constants";

function filledDotsCount(progress: HTMLElement) {
  return progress.querySelectorAll('[data-filled="true"]').length;
}

describe("<GoalStatus>", () => {
  it("renders 0/GOAL with no filled dots when there are no letters", () => {
    render(<GoalStatus count={0} />);

    expect(screen.getByText(`0/${GOAL_LETTERS} applications generated`)).toBeInTheDocument();
    const progress = screen.getByRole("img", {
      name: `0 of ${GOAL_LETTERS} applications generated`,
    });
    expect(filledDotsCount(progress)).toBe(0);
  });

  it("fills dots one-by-one as letters are generated", () => {
    render(<GoalStatus count={3} />);

    expect(screen.getByText(`3/${GOAL_LETTERS} applications generated`)).toBeInTheDocument();
    const progress = screen.getByRole("img", {
      name: `3 of ${GOAL_LETTERS} applications generated`,
    });
    expect(filledDotsCount(progress)).toBe(3);
  });

  it("swaps dots for the check badge once the goal is reached", () => {
    render(<GoalStatus count={GOAL_LETTERS} />);

    expect(
      screen.getByText(`${GOAL_LETTERS}/${GOAL_LETTERS} applications generated`),
    ).toBeInTheDocument();
    // Dots are replaced (not just fully filled) so the milestone reads at a
    // glance — there's no "X of 5 applications generated" img anymore, only
    // the "Goal reached: …" badge.
    expect(
      screen.queryByRole("img", { name: /^\d+ of \d+ applications generated$/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: `Goal reached: ${GOAL_LETTERS} of ${GOAL_LETTERS} applications generated`,
      }),
    ).toBeInTheDocument();
  });

  it("caps the displayed count at GOAL even when more letters exist", () => {
    render(<GoalStatus count={42} />);

    expect(
      screen.getByText(`${GOAL_LETTERS}/${GOAL_LETTERS} applications generated`),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: `Goal reached: ${GOAL_LETTERS} of ${GOAL_LETTERS} applications generated`,
      }),
    ).toBeInTheDocument();
  });
});
