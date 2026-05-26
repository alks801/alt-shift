import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Textarea } from "@/components/ui/Field/Textarea";
import { DETAILS_MAX_LENGTH } from "@/lib/constants";

describe("<Textarea> soft limit", () => {
  it("renders the counter as current/limit and stays valid below the limit", () => {
    render(
      <Textarea
        label="Additional details"
        value={"a".repeat(10)}
        onChange={() => {}}
        softMaxLength={DETAILS_MAX_LENGTH}
        showCounter
      />,
    );

    const textarea = screen.getByRole("textbox", { name: "Additional details" });
    expect(textarea).not.toHaveAttribute("aria-invalid");
    expect(textarea).not.toHaveClass("invalid");

    const counter = screen.getByText(`10/${DETAILS_MAX_LENGTH}`);
    expect(counter).not.toHaveAttribute("data-over-limit");
  });

  it("flips to the invalid style when the value goes past the soft limit", () => {
    render(
      <Textarea
        label="Additional details"
        value={"a".repeat(DETAILS_MAX_LENGTH + 1)}
        onChange={() => {}}
        softMaxLength={DETAILS_MAX_LENGTH}
        showCounter
      />,
    );

    const textarea = screen.getByRole("textbox", { name: "Additional details" });
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveClass("invalid");

    const counter = screen.getByText(`${DETAILS_MAX_LENGTH + 1}/${DETAILS_MAX_LENGTH}`);
    expect(counter).toHaveAttribute("data-over-limit", "true");
  });

  it("does not enforce a hard cap — typing past the soft limit is allowed", () => {
    const long = "a".repeat(DETAILS_MAX_LENGTH + 50);
    render(
      <Textarea
        label="Additional details"
        value={long}
        onChange={() => {}}
        softMaxLength={DETAILS_MAX_LENGTH}
        showCounter
      />,
    );

    const textarea = screen.getByRole("textbox", {
      name: "Additional details",
    }) as HTMLTextAreaElement;
    expect(textarea).not.toHaveAttribute("maxlength");
    expect(textarea.value).toHaveLength(DETAILS_MAX_LENGTH + 50);
  });
});
