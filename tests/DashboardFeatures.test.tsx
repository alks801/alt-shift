import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardFeatures } from "@/components/letters/DashboardFeatures/DashboardFeatures";

describe("<DashboardFeatures>", () => {
  it("renders a section h2 plus exactly three feature cards", () => {
    render(<DashboardFeatures />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      /start writing your cover letter/i,
    );
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
  });

  it("includes the privacy claim about local-only storage", () => {
    render(<DashboardFeatures />);
    expect(screen.getByText(/no accounts, no uploads/i)).toBeInTheDocument();
  });
});
