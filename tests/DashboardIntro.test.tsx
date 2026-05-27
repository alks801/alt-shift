import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardIntro } from "@/components/letters/DashboardIntro/DashboardIntro";

describe("<DashboardIntro>", () => {
  it("renders the page-level h1 hero", () => {
    render(<DashboardIntro />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(/cover letters that .*sound like you/i);
  });

  it("renders the value-prop subtitle (single sentence describing the product)", () => {
    render(<DashboardIntro />);
    expect(screen.getByText(/draft a sincere, tailored letter/i)).toBeInTheDocument();
  });
});
