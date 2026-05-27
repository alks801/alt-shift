import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRef } from "react";
import { useMobileScrollTo } from "@/lib/hooks/useMobileScrollTo";

/**
 * jsdom implements neither `matchMedia` nor `scrollIntoView`, so we stub both.
 * `matches` is what drives the mobile-vs-desktop branch; the scroll spy is how
 * we assert the effect fired.
 */
function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

const scrollIntoView = vi.fn();

beforeEach(() => {
  scrollIntoView.mockClear();
  Element.prototype.scrollIntoView = scrollIntoView;
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** Render the hook with a real DOM node attached to `ref`, so `ref.current`
 *  is non-null when the effect fires. Returns a `rerender` that re-evaluates
 *  the predicate (driven by `predicate` parameter). */
function renderWithRef(initialPredicate: boolean) {
  return renderHook(
    ({ predicate }: { predicate: boolean }) => {
      const ref = useRef<HTMLDivElement>(document.createElement("div"));
      useMobileScrollTo(ref, () => predicate);
      return ref;
    },
    { initialProps: { predicate: initialPredicate } },
  );
}

describe("useMobileScrollTo", () => {
  it("scrolls when the predicate is true on mount and the viewport is mobile", () => {
    mockMatchMedia(true);
    renderWithRef(true);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });

  it("does not scroll on desktop even when the predicate is true", () => {
    mockMatchMedia(false);
    renderWithRef(true);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("does not scroll when the predicate is false", () => {
    mockMatchMedia(true);
    renderWithRef(false);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("scrolls on the false → true transition", () => {
    mockMatchMedia(true);
    const { rerender } = renderWithRef(false);
    expect(scrollIntoView).not.toHaveBeenCalled();

    rerender({ predicate: true });
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("does not fire repeatedly while the predicate stays true", () => {
    mockMatchMedia(true);
    const { rerender } = renderWithRef(true);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);

    rerender({ predicate: true });
    rerender({ predicate: true });
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("fires again on each false → true transition", () => {
    mockMatchMedia(true);
    const { rerender } = renderWithRef(true);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);

    rerender({ predicate: false });
    rerender({ predicate: true });
    expect(scrollIntoView).toHaveBeenCalledTimes(2);
  });
});
