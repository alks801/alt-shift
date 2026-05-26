import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

// crypto.randomUUID is available in modern jsdom but guard for older runners.
if (typeof crypto !== "undefined" && !("randomUUID" in crypto)) {
  Object.defineProperty(crypto, "randomUUID", {
    value: () => `test-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  });
}
