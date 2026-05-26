import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useLetters } from "@/lib/hooks/useLetters";
import { loadLetters } from "@/lib/storage/letters";
import { STORAGE_KEY } from "@/lib/constants";

/** Simulate another tab: write storage, then deliver the event jsdom skips. */
function writeFromOtherTab(payload: string | null) {
  if (payload === null) window.localStorage.removeItem(STORAGE_KEY);
  else window.localStorage.setItem(STORAGE_KEY, payload);
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: payload }));
}

const ONE_LETTER = JSON.stringify({
  version: 1,
  letters: [
    {
      id: "from-other-tab",
      jobTitle: "Engineer",
      company: "Linear",
      body: "Hello.",
      createdAt: 1,
      updatedAt: 1,
    },
  ],
});

describe("useLetters", () => {
  it("hydrates from localStorage and exposes empty state", async () => {
    const { result } = renderHook(() => useLetters());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.letters).toEqual([]);
  });

  it("creates, updates and deletes letters; persists between hook instances", async () => {
    const first = renderHook(() => useLetters());
    await waitFor(() => expect(first.result.current.hydrated).toBe(true));

    let createdId = "";
    act(() => {
      const letter = first.result.current.createLetter({
        jobTitle: "PM",
        company: "Apple",
        body: "Dear Apple team, hello.",
      });
      createdId = letter.id;
    });
    expect(first.result.current.letters).toHaveLength(1);
    expect(first.result.current.letters[0]).toMatchObject({
      jobTitle: "PM",
      company: "Apple",
      body: "Dear Apple team, hello.",
    });

    act(() => {
      first.result.current.updateLetterBody(createdId, "Updated body.");
    });
    expect(first.result.current.letters[0].body).toBe("Updated body.");

    // Simulate a fresh page load: a new hook instance must read the same data.
    first.unmount();
    const second = renderHook(() => useLetters());
    await waitFor(() => expect(second.result.current.hydrated).toBe(true));
    expect(second.result.current.letters).toHaveLength(1);
    expect(second.result.current.letters[0].body).toBe("Updated body.");

    act(() => {
      second.result.current.deleteLetter(createdId);
    });
    expect(second.result.current.letters).toEqual([]);
    expect(loadLetters()).toEqual([]);
  });

  describe("cross-tab sync", () => {
    it("syncs writes and deletes from another tab", async () => {
      const { result } = renderHook(() => useLetters());
      await waitFor(() => expect(result.current.hydrated).toBe(true));
      expect(result.current.letters).toEqual([]);

      act(() => writeFromOtherTab(ONE_LETTER));
      await waitFor(() => expect(result.current.letters).toHaveLength(1));

      act(() => writeFromOtherTab(JSON.stringify({ version: 1, letters: [] })));
      await waitFor(() => expect(result.current.letters).toEqual([]));
    });

    it("ignores storage events for unrelated keys", async () => {
      window.localStorage.setItem(STORAGE_KEY, ONE_LETTER);
      const { result } = renderHook(() => useLetters());
      await waitFor(() => expect(result.current.letters).toHaveLength(1));

      act(() => {
        window.dispatchEvent(new StorageEvent("storage", { key: "other-key" }));
      });

      expect(result.current.letters).toHaveLength(1);
    });
  });

  it("does not overwrite stored letters during the initial hydration commit", async () => {
    // Pre-seed storage as if from a previous session.
    window.localStorage.setItem(
      "alt-shift:letters:v1",
      JSON.stringify({
        version: 1,
        letters: [
          {
            id: "seed",
            jobTitle: "Designer",
            company: "Linear",
            body: "Dear Linear team,",
            createdAt: 1,
            updatedAt: 1,
          },
        ],
      }),
    );

    const { result } = renderHook(() => useLetters());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    expect(result.current.letters).toHaveLength(1);
    expect(loadLetters()).toHaveLength(1);
  });
});
