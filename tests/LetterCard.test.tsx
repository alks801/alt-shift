import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { LetterCard } from "@/components/letters/LetterCard";
import type { Letter } from "@/lib/types";

const LETTER: Letter = {
  id: "abc",
  jobTitle: "Product manager",
  company: "Apple",
  body: "Dear Apple Team,\n\nI am excited to apply.",
  createdAt: 0,
  updatedAt: 0,
};

describe("<LetterCard>", () => {
  it("renders the job + company header and body preview", () => {
    render(<LetterCard letter={LETTER} onDelete={() => {}} />);
    expect(screen.getByText("Product manager, Apple")).toBeInTheDocument();
    expect(screen.getByText(/Dear Apple Team/)).toBeInTheDocument();
  });

  it("opens the confirm dialog before deleting and triggers onDelete on confirm", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<LetterCard letter={LETTER} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: /^Delete/ }));
    const dialog = screen.getByRole("alertdialog");

    await user.click(within(dialog).getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith("abc");
  });

  it("does not call onDelete when the user cancels", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<LetterCard letter={LETTER} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: /^Delete/ }));
    const dialog = screen.getByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Keep it" }));

    expect(onDelete).not.toHaveBeenCalled();
  });
});
