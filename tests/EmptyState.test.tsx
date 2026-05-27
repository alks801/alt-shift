import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "@/components/letters/EmptyState/EmptyState";
import { GOAL_LETTERS } from "@/lib/constants";

describe("<EmptyState>", () => {
  it("renders a section h2 with the empty headline", () => {
    render(<EmptyState />);
    expect(
      screen.getByRole("heading", { level: 2, name: "No applications yet" }),
    ).toBeInTheDocument();
  });

  it("references the goal in the subtitle so the empty state has a concrete next step", () => {
    render(<EmptyState />);
    expect(screen.getByText(new RegExp(`${GOAL_LETTERS}`))).toBeInTheDocument();
  });

  it("exposes the CTA as a link to /new", () => {
    render(<EmptyState />);
    const cta = screen.getByRole("link", { name: /start your first letter/i });
    expect(cta).toHaveAttribute("href", "/new");
  });
});
