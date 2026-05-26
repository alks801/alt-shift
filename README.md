# Alt+Shift — AI cover letters

A small HR-tech app that nudges job seekers to write at least 5 cover letters,
generating each one with AI and tracking progress toward the goal.

> **Live demo:** [alt-shift.vercel.app](https://alt-shift.vercel.app)
>
> Reference: [Variant Group React Developer Test Assignment](https://variantnet.notion.site/React-Developer-Test-Assignment-Variant-Group-d7a1e3460dc643958eb57a0518ce84b2).

## Quick start

```bash
npm install
cp .env.example .env.local   # leave OPENAI_API_KEY empty to use the built-in mock
npm run dev                  # http://localhost:3000
```

| Script                    | What it does                               |
| ------------------------- | ------------------------------------------ |
| `npm run dev`             | Next.js dev server                         |
| `npm run build`           | Production build                           |
| `npm run typecheck`       | `tsc --noEmit`                             |
| `npm run lint`            | ESLint (`next/core-web-vitals` + TS)       |
| `npm run format`          | Prettier write                             |
| `npm run format:check`    | Prettier check (CI-safe)                   |
| `npm test`                | Vitest + Testing Library (jsdom)           |
| `npm run test:coverage`   | Vitest with v8 coverage report (HTML+text) |
| `npm run test:e2e`        | Playwright E2E tests (Chromium)            |
| `npm run storybook`       | Storybook dev server (port 6006)           |
| `npm run build-storybook` | Static Storybook build                     |

## Stack

- **Next.js 15 (App Router) + React 19 + TypeScript** — file-based routing and
  a single server route for the AI proxy without standing up a separate API.
- **CSS Modules + design tokens in `:root` CSS variables** — no Tailwind (per
  brief), no CSS-in-JS runtime, zero classname collisions, themable.
- **Custom `<Icon>`** rendering SVGs via CSS `mask-image` so monochrome icons
  inherit `currentColor`.
- **`localStorage` with a versioned envelope** for persistence — survives
  reloads, works offline, no backend.
- **`openai` SDK** server-side only; a randomized mock when the key is
  missing.
- **Vitest + Testing Library** (jsdom). **Playwright** for E2E.
  **Storybook 10** for component catalogue.
- **Prettier + ESLint** (no overlap via `eslint-config-prettier`).
  **Husky + lint-staged + commitlint** (conventional commits).

## Project structure

```
src/
├── app/
│   ├── api/generate/route.ts  AI proxy (OpenAI or mock)
│   ├── new/page.tsx           Form + preview
│   ├── page.tsx               Dashboard
│   ├── layout.tsx             Root layout, Fixel fonts, LettersProvider
│   └── globals.css            Resets + token import
├── components/
│   ├── ui/                    Primitives (Button, Field, Icon, Title, …)
│   ├── layout/                AppHeader, PageContainer
│   └── letters/               Domain components
├── lib/
│   ├── ai/                    client.ts, mock.ts, prompt.ts
│   ├── letters/               LettersContext (single source of truth)
│   ├── hooks/                 useLetters, useCopyToClipboard
│   ├── storage/letters.ts     Versioned localStorage adapter
│   ├── cx.ts                  className combiner
│   ├── constants.ts
│   └── types.ts
└── styles/tokens.css          Colors, spacing, radii, typography, breakpoints

tests/                          38 unit tests across 8 files (see "Testing" below)
e2e/                            17 Playwright E2E tests
```

## Decision log

> Why these choices, in the words of the trade-off being made.

### Stack — Next.js App Router

Picked over a Vite SPA because the brief asks for real AI integration and
shipping an OpenAI key to the browser is unacceptable. The `/api/generate`
route runs on the server; the client only ever sees plain text.

### Styling — CSS Modules + CSS variables

No Tailwind (brief) and no CSS-in-JS runtime. Tokens in `src/styles/tokens.css`
are the API of the visual system; components read `var(--space-4)` instead of
magic numbers, so a future theme is a one-file change. CSS Modules give
collision-free local class names with zero runtime.

### Component layering (`ui → layout → letters`)

Sorted by domain coupling. Primitives in `ui/` know nothing about letters or
goals; domain components live in `letters/`. Concrete consequence: `Button`
exposes a `buttonClassName()` helper that `ButtonLink` reuses, instead of
the `<a><button/></a>` antipattern.

### AI — server-only, Promise-based client, no async generators

`generateCoverLetter(input, { signal }): Promise<string>` is a plain async
function. The loading state uses a calmer floating-orb animation instead of
progressive text reveal, so the client accumulates chunks silently and
resolves once the stream ends. A 30-second timeout aborts stalled requests
and surfaces a clear "timed out" error. Server returns JSON `{ error }` on
failure with the right status — no silent "swap in the mock on failure"
behaviour.

### Persistence — versioned `localStorage` envelope

Key is `alt-shift:letters:v1`; payload is `{ version: 1, letters: [...] }`.
Bad JSON or wrong shape fails closed to "empty list" instead of crashing
the dashboard. To migrate the schema: bump the key, write a one-shot
migration, drop the old key after a grace period.

### Single context, single hydration

`<LettersProvider>` mounts `useLetters` once at the root. The dashboard and
the `/new` form share the same in-memory list, so they can't diverge and
there's only one hydration round-trip. The `hydrated` flag is included in
the persist effect's deps to prevent the initial empty placeholder array
from overwriting stored data on first commit (subtle, easy to miss).

### "Try Again" overwrites, not appends

The first successful generation in a session creates a letter; subsequent
regenerations overwrite it. Otherwise rapid experimentation would flood the
dashboard with discarded drafts. Leaving `/new` drops the session id.

### Soft 1200-char limit on "Additional details"

The textarea flips to its invalid style + counter turns red past the limit,
and the form blocks submit, but typing past it is allowed. Mirrors the
Figma "Too much text" state and is friendlier than `maxlength` (no
truncation surprise on paste).

### `ConfirmDialog` instead of native `confirm()`

Native `confirm()` doesn't match the design system, can't be styled, and
varies per OS. Custom dialog has `role="alertdialog"`, focus management,
Esc/backdrop close, scroll lock, and respects `prefers-reduced-motion`.

### Scrollbar gutter reservation

`html { scrollbar-gutter: stable; }` globally — opening the delete dialog
locks `body` scroll, which would otherwise shift content 15px to the right
when the scrollbar disappears.

### Icons — custom `<Icon>` over `lucide-react`

Monochrome icons render via CSS `mask-image` so they pick up `currentColor`
(critical for hover states, danger tones, copy-success swap). Multi-colour
icons (the `cat` empty-state mark) use `background-image` instead.
Trade-off: each icon needs to be added to `IconName`; we pay it for tight
visual control and a 12 kB bundle win from dropping `lucide-react`.

### Mobile

Two breakpoints, documented in `tokens.css`:

- `≤640` — phones: single column everywhere, `PageContainer` gutter 32→16,
  CTAs full-width, `Logo` 48→32px tall, `GoalStatus` text hides (dots stay).
- `≤960` — tablets: `/new` stacks its form + preview (two ~480px columns
  feel cramped). Dashboard grid stays 2-up.

On stacked layouts, pressing Generate auto-scrolls the preview into view
(`scrollIntoView` gated on `matchMedia("(max-width: 960px)")`) — without it
the result appears off-screen and the user wonders if anything happened.

Card height stays a fixed 240px on phones (per spec) — they just stack
vertically, no in-card density changes. Tap targets stay at the Figma 40px
for the icon link; not bumped to 44px to preserve the desktop visual.

### Hygiene

- **KISS pass** before sign-off: dropped `IconButton`, `Text`, and unused
  `Button` variants/sizes; trimmed dead `useLetters` methods; removed unused
  `Field` props (`hint`/`error`/`invalid`) and `Button{Link}` props
  (`trailingIcon`/`fullWidth`/`className`); pruned 10 unused design tokens.
- **Conventional commits** enforced via commitlint on `commit-msg`.
- **`pre-commit`** runs `lint-staged`: ESLint + Prettier on changed files
  only — fast feedback, no formatting drift.

## Testing

### Unit tests (Vitest + Testing Library)

38 tests across 8 files; `npm run test:coverage` reports ~65% statements
(business logic — `useLetters`, `LetterForm`, `Textarea`, `GoalBanner`,
`GoalStatus`, `LetterCard`, `LetterPreview` — sits at 80–100%).

Conventions: semantic queries (`getByRole` + accessible names), no
snapshots, no over-mocking. Boundary cases at the soft limit, goal cap,
and hydration race are explicitly covered.

### E2E tests (Playwright)

17 tests covering the full user journey in Chromium:

- **Dashboard** — empty state, progress display, CTA navigation.
- **Navigation** — logo, home icon, Create New.
- **Form validation** — disabled button, soft limit counter.
- **Generation flow** — happy path (generate → preview → dashboard),
  "Try Again" deduplication, localStorage persistence across reloads.
- **Delete flow** — confirm dialog deletes, cancel preserves.
- **Goal progress** — banner appears below 5, hides at 5.

Run `npm run test:e2e` (requires a dev server on port 3001 or let
Playwright start one automatically).

### Selector management — `marker-tree`

E2E selectors are managed via
[`marker-tree`](https://www.npmjs.com/package/marker-tree) — a single
typed tree object that is shared between application code and tests.

Components spread `{...m.nodeProps}` to emit `data-test` attributes;
Playwright reads `m.selector` to locate elements. The tree lives in
`src/lib/markers.ts` and mirrors the page hierarchy:

```
app
├── header        (logo · goalStatus · homeLink)
├── dashboard     (createNew · emptyState · letterGrid → cards(id) · goalBanner)
├── newLetter     (form → jobTitle/company/strengths/details/submit · preview · goalBanner)
└── confirmDialog (confirm · cancel)
```

Benefits:

- **Single source of truth** — rename a node once, both markup and tests
  update (TypeScript catches stale references at compile time).
- **Hierarchical `data-test` values** — rendered as
  `data-test="app/dashboard/letterGrid/cards/e2e-del/deleteButton"`,
  making DOM inspection self-documenting.
- **`byKey` for dynamic lists** — `cards(letter.id)` generates unique
  selectors per letter without manual string interpolation.

### Storybook

Component catalogue at `http://localhost:6006` (`npm run storybook`).
14 stories across two groups:

**`ui/`** — `Button` (8 states), `Input` (4), `Textarea` (4 incl.
over-limit), `Icon` (catalog + danger tint), `Title` (3 sizes),
`ProgressDots` (dots / bars, 0→5 progression), `IconAction` (3 tones),
`CopyButton`, `ConfirmDialog` (danger / neutral).

**`letters/`** — `LetterPreview` (idle / loading / ready / error),
`LetterCard` (short / long text), `GoalBanner` (dashboard / form,
1–4 progress), `GoalStatus` (0 / 3 / 5 / 7), `EmptyState`.

## AI workflow

Built in **Cursor + Claude**.

- The design-system layer (tokens, primitives, `ConfirmDialog`, layout) is
  hand-architected; the model filled in CSS once the surfaces were set.
- First pass had a hand-rolled OpenAI SSE parser; second pass swapped to
  the official `openai` SDK (−25 lines, fewer footguns).
- After the first end-to-end version I ran a deliberate KISS pass —
  trimming unused props, dead components, and silent fallback paths — and
  treated the resulting deltas as their own code review.
- Where the model pushed for premature abstractions (Text wrapper, generic
  `IconButton`, etc.) or `<Link>`-around-`<Button>` antipatterns, I pushed
  back and removed them.

## CI / CD

Two GitHub Actions workflows live in `.github/workflows/`:

### `ci.yml` — on every push / PR to `main`

Prettier → ESLint → TypeScript → Vitest (unit) → Playwright (E2E) → `next build`.
Catches formatting drift, type errors, and regressions before merge.

### `deploy.yml` — manual (`workflow_dispatch`)

1. Builds the Docker image (multi-stage, `standalone` output, ~120 MB).
2. Pushes to GHCR (`ghcr.io/<owner>/alt-shift:<sha>`).
3. SSHes into VPS and restarts the container.

Required secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`,
optionally `OPENAI_API_KEY`.

### Docker

```bash
docker build -t alt-shift .
docker run -p 3000:3000 alt-shift
```

The Dockerfile uses a 3-stage build (`deps → build → prod`) with
`node:20-alpine` and Next.js `output: "standalone"` for a minimal
production image (~120 MB vs ~1 GB with full `node_modules`).

## Deploy to Vercel

1. Push the repo to GitHub.
2. In Vercel: "New Project" → import the repo. Default Next.js settings work.
3. (Optional) add `OPENAI_API_KEY` and `OPENAI_MODEL` env vars. Without
   them the deployed app uses the built-in mock and stays fully demoable.
