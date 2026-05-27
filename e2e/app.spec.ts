import { test, expect, type Page } from "@playwright/test";
import { markers } from "../src/lib/markers";

const { header, dashboard, newLetter, confirmDialog } = markers;

/** Seed localStorage with letters and reload so the app picks them up. */
async function seedLetters(page: Page, letters: Record<string, unknown>[]) {
  await page.evaluate(
    (data) =>
      window.localStorage.setItem(
        "alt-shift:letters:v1",
        JSON.stringify({ version: 1, letters: data }),
      ),
    letters,
  );
  await page.reload();
}

function makeLetter(
  overrides: Partial<{ id: string; jobTitle: string; company: string; body: string }> = {},
) {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    jobTitle: overrides.jobTitle ?? "Tester",
    company: overrides.company ?? "TestCo",
    body: overrides.body ?? "Dear TestCo Team, this is a test letter.",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Dashboard — empty state
// ---------------------------------------------------------------------------

test.describe("Dashboard (empty)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
  });

  test("shows empty state with CTA when no letters exist", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "No applications yet" })).toBeVisible();
    await expect(page.locator(dashboard.emptyState.cta.selector)).toBeVisible();
  });

  test("header hides goal status when no letters exist", async ({ page }) => {
    await expect(page.getByText("applications generated")).not.toBeVisible();
  });

  test("empty state CTA navigates to /new", async ({ page }) => {
    await page.locator(dashboard.emptyState.cta.selector).click();
    await expect(page).toHaveURL("/new");
  });
});

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

test.describe("Navigation", () => {
  test("logo navigates to dashboard", async ({ page }) => {
    await page.goto("/new");
    await page.locator(header.logo.selector).click();
    await expect(page).toHaveURL("/");
  });

  test("home icon navigates to dashboard", async ({ page }) => {
    await page.goto("/new");
    await page.locator(header.homeLink.selector).click();
    await expect(page).toHaveURL("/");
  });

  test("Create New button navigates to /new", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await page.locator(dashboard.emptyState.cta.selector).click();
    await expect(page).toHaveURL("/new");
  });
});

// ---------------------------------------------------------------------------
// Form validation
// ---------------------------------------------------------------------------

test.describe("Form validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/new");
  });

  test("Generate button is disabled when required fields are empty", async ({ page }) => {
    await expect(page.locator(newLetter.form.submit.selector)).toBeDisabled();
  });

  test("Generate button enables when job title and company are filled", async ({ page }) => {
    await page.getByLabel("Job title").fill("Designer");
    await page.getByLabel("Company").fill("Apple");
    await expect(page.locator(newLetter.form.submit.selector)).toBeEnabled();
  });

  test("soft limit: counter turns red past 1200 chars and blocks submit", async ({ page }) => {
    await page.getByLabel("Job title").fill("Designer");
    await page.getByLabel("Company").fill("Apple");
    await page.getByLabel("Additional details").fill("a".repeat(1201));
    await expect(page.getByText("1201/1200")).toBeVisible();
    await expect(page.locator(newLetter.form.submit.selector)).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Happy path: generate → dashboard → persistence
// ---------------------------------------------------------------------------

test.describe("Generation flow", () => {
  test("generates a letter and shows it in preview", async ({ page }) => {
    await page.goto("/new");
    await page.getByLabel("Job title").fill("Engineer");
    await page.getByLabel("Company").fill("Stripe");
    await page.locator(newLetter.form.submit.selector).click();

    await expect(page.locator(newLetter.preview.body.selector)).toContainText("Dear Stripe Team", {
      timeout: 15_000,
    });
    await expect(page.locator(newLetter.form.submit.selector)).toContainText("Try Again");
  });

  test("generated letter appears on dashboard", async ({ page }) => {
    await page.goto("/new");
    await page.getByLabel("Job title").fill("Engineer");
    await page.getByLabel("Company").fill("Stripe");
    await page.locator(newLetter.form.submit.selector).click();
    await expect(page.locator(newLetter.preview.body.selector)).toContainText("Dear Stripe Team", {
      timeout: 15_000,
    });

    const stored = await page.evaluate(() => window.localStorage.getItem("alt-shift:letters:v1"));
    await page.goto("/");
    await page.evaluate((data) => {
      if (data) window.localStorage.setItem("alt-shift:letters:v1", data);
    }, stored);
    await page.reload();

    await expect(page.getByText("Dear Stripe Team")).toBeVisible();
    await expect(page.getByText("1/5 applications generated")).toBeVisible();
  });

  test("Try Again replaces the text without creating a duplicate", async ({ page }) => {
    await page.goto("/new");
    await page.getByLabel("Job title").fill("PM");
    await page.getByLabel("Company").fill("Google");
    await page.locator(newLetter.form.submit.selector).click();
    await expect(page.locator(newLetter.preview.body.selector)).toContainText("Dear Google Team", {
      timeout: 15_000,
    });

    await page.locator(newLetter.form.submit.selector).click();
    await expect(page.locator(newLetter.preview.body.selector)).toContainText("Dear Google Team", {
      timeout: 15_000,
    });

    const stored = await page.evaluate(() => window.localStorage.getItem("alt-shift:letters:v1"));
    await page.goto("/");
    await page.evaluate((data) => {
      if (data) window.localStorage.setItem("alt-shift:letters:v1", data);
    }, stored);
    await page.reload();

    await expect(page.getByRole("article")).toHaveCount(1);
  });

  test("generated letter persists after page reload", async ({ page }) => {
    await page.goto("/new");
    await page.getByLabel("Job title").fill("Designer");
    await page.getByLabel("Company").fill("Apple");
    await page.locator(newLetter.form.submit.selector).click();
    await expect(page.locator(newLetter.preview.body.selector)).toContainText("Dear Apple Team", {
      timeout: 15_000,
    });

    const stored = await page.evaluate(() => window.localStorage.getItem("alt-shift:letters:v1"));
    await page.goto("/");
    await page.evaluate((data) => {
      if (data) window.localStorage.setItem("alt-shift:letters:v1", data);
    }, stored);
    await page.reload();

    await expect(page.getByText("Dear Apple Team")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Delete flow
// ---------------------------------------------------------------------------

test.describe("Delete flow", () => {
  test("deletes a card via confirm dialog", async ({ page }) => {
    await page.goto("/");
    await seedLetters(page, [makeLetter({ id: "e2e-del", body: "Dear TestCo Team, delete me." })]);

    await expect(page.getByText("Dear TestCo Team, delete me.")).toBeVisible();
    await page.locator(dashboard.letterGrid.cards("e2e-del").deleteButton.selector).click();

    const dialog = page.locator(confirmDialog.selector);
    await expect(dialog).toBeVisible();
    await page.locator(confirmDialog.confirm.selector).click();

    await expect(page.getByText("Dear TestCo Team, delete me.")).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "No applications yet" })).toBeVisible();
  });

  test("cancel keeps the card", async ({ page }) => {
    await page.goto("/");
    await seedLetters(page, [makeLetter({ id: "e2e-keep", body: "Dear KeepCo Team, keep me." })]);

    await page.locator(dashboard.letterGrid.cards("e2e-keep").deleteButton.selector).click();
    await page.locator(confirmDialog.cancel.selector).click();

    await expect(page.getByText("Dear KeepCo Team, keep me.")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Goal progress & banner
// ---------------------------------------------------------------------------

test.describe("Goal progress", () => {
  test("goal banner appears on dashboard when letters < 5", async ({ page }) => {
    await page.goto("/");
    const letters = Array.from({ length: 3 }, (_, i) =>
      makeLetter({ id: `goal-${i}`, body: `Letter ${i}` }),
    );
    await seedLetters(page, letters);

    await expect(page.getByText("3/5 applications generated")).toBeVisible();
    await expect(page.locator(dashboard.goalBanner.selector)).toBeVisible();
    await expect(page.locator(dashboard.goalBanner.progress.selector)).toContainText("3 out of 5");
  });

  test("goal banner hides when 5 letters reached", async ({ page }) => {
    await page.goto("/");
    const letters = Array.from({ length: 5 }, (_, i) =>
      makeLetter({ id: `full-${i}`, body: `Letter ${i}` }),
    );
    await seedLetters(page, letters);

    await expect(page.getByText("5/5 applications generated")).toBeVisible();
    await expect(page.locator(dashboard.goalBanner.selector)).not.toBeVisible();
  });
});
